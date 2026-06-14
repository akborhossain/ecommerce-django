"""
Admin Panel API Views
Covers: Dashboard, Orders, Products, Stock, Users, Roles, Permissions, Tracking
All endpoints are protected by RBAC (role-based access control).
"""
import logging
from datetime import datetime, timedelta
import math

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Sum, Count, Q, Subquery, OuterRef, Exists
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status

from product.models import Product, ProductVariant, Category
from product.serializers import ProductSerializer, CategorySerializer
from orders.models import Order, OrderItem, OrderTracking, ReturnRequest, ReturnItem
from orders.serializers import OrderSerializer, OrderTrackingSerializer, ReturnRequestSerializer

from .models import RBACPermission, Role, UserRole, UserDirectPermission
from .serializers import (
    RBACPermissionSerializer, RoleSerializer,
    AdminUserSerializer, UserRoleSerializer, UserDirectPermissionSerializer
)
from .rbac import (
    user_has_permission, get_user_permissions,
    MANAGE_DASHBOARD, MANAGE_ORDERS, MANAGE_PRODUCTS,
    MANAGE_STOCK, MANAGE_USERS, MANAGE_ROLES, MANAGE_PERMISSIONS
)

logger = logging.getLogger(__name__)

PAGE_SIZE = 20


def check_perm(user, codename):
    """Return 403 JSON response if user lacks permission, else None."""
    if not (user.is_superuser or user_has_permission(user, codename)):
        return JsonResponse({'detail': f'Permission denied. Required: {codename}'},
                            status=403)
    return None


def paginate_qs(queryset, request, serializer_class, page_size=PAGE_SIZE):
    """Paginate a queryset and return a dict with data, count, page, pages."""
    page = int(request.GET.get('page', 1))
    if page < 1:
        page = 1
    total = queryset.count()
    pages = max(1, math.ceil(total / page_size))
    if page > pages:
        page = pages
    start = (page - 1) * page_size
    end = start + page_size
    items = queryset[start:end]
    serializer = serializer_class(items, many=True)
    return {
        'data': serializer.data,
        'count': total,
        'page': page,
        'pages': pages,
    }


# ═══════════════════════════════════════════════════════════
#  DASHBOARD
# ═══════════════════════════════════════════════════════════
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        err = check_perm(request.user, MANAGE_DASHBOARD)
        if err:
            return err

        now = datetime.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0)

        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(isPaid=False).count()
        delivered_orders = Order.objects.filter(isDelivered=True).count()
        total_revenue = Order.objects.filter(isPaid=True).aggregate(
            s=Sum('totalPrice'))['s'] or 0
        monthly_revenue = Order.objects.filter(
            isPaid=True, paidAt__gte=month_start).aggregate(
            s=Sum('totalPrice'))['s'] or 0

        total_products = Product.objects.count()
        low_stock = Product.objects.filter(countInStock__lte=5, countInStock__gte=0).count()
        out_of_stock = Product.objects.filter(countInStock=0).count()

        total_users = User.objects.count()
        new_users = User.objects.filter(date_joined__gte=month_start).count()

        recent_orders = Order.objects.select_related('createdBy').order_by('-createdAt')[:10]
        recent_orders_data = []
        for o in recent_orders:
            recent_orders_data.append({
                'id': o._id,
                'customer': o.createdBy.get_full_name() or o.createdBy.email if o.createdBy else 'Guest',
                'email': o.createdBy.email if o.createdBy else '',
                'total': float(o.totalPrice or 0),
                'isPaid': o.isPaid,
                'isDelivered': o.isDelivered,
                'createdAt': o.createdAt.strftime('%Y-%m-%d') if o.createdAt else '',
                'paymentMethod': o.paymentMethod,
            })

        # Monthly orders for sparkline
        monthly_data = []
        for i in range(6, 0, -1):
            d = now - timedelta(days=30 * i)
            month_end = (d.replace(day=1) + timedelta(days=32)).replace(day=1)
            cnt = Order.objects.filter(createdAt__gte=d.replace(day=1), createdAt__lt=month_end).count()
            monthly_data.append({'month': d.strftime('%b'), 'orders': cnt})

        return JsonResponse({
            'orders': {
                'total': total_orders,
                'pending': pending_orders,
                'delivered': delivered_orders,
            },
            'revenue': {
                'total': float(total_revenue),
                'monthly': float(monthly_revenue),
            },
            'products': {
                'total': total_products,
                'low_stock': low_stock,
                'out_of_stock': out_of_stock,
            },
            'users': {
                'total': total_users,
                'new_this_month': new_users,
            },
            'recent_orders': recent_orders_data,
            'monthly_data': monthly_data,
        })


# ═══════════════════════════════════════════════════════════
#  ORDERS (with pagination, auto-stock, auto-tracking)
# ═══════════════════════════════════════════════════════════
class AdminOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        err = check_perm(request.user, MANAGE_ORDERS)
        if err:
            return err


        if pk:
            try:
                order = Order.objects.select_related('createdBy').get(_id=pk)
                serializer = OrderSerializer(order)
                return JsonResponse({'data': serializer.data})
            except Order.DoesNotExist:
                return JsonResponse({'detail': 'Order not found'}, status=404)

        # Filters
        q = request.GET.get('q', '')
        is_paid = request.GET.get('isPaid', '')
        is_delivered = request.GET.get('isDelivered', '')
        status_filter = request.GET.get('status', '')

        # Get count stats for tabs
        # Annotate order query with latest tracking status and presence of return request
        latest_tracking = OrderTracking.objects.filter(order=OuterRef('pk')).order_by('-id')
        base_orders = Order.objects.select_related('createdBy').annotate(
            latest_tracking_status=Subquery(latest_tracking.values('status')[:1]),
            has_return_request=Exists(ReturnRequest.objects.filter(order=OuterRef('pk')))
        )

        counts = {
            'all': base_orders.count(),
            'pending': base_orders.filter(isPaid=False, isCancelled=False, deliveryFailed=False).count(),
            'confirmed': base_orders.filter(isPaid=True, isDelivered=False, isCancelled=False, deliveryFailed=False).exclude(
                latest_tracking_status__in=['shipped', 'out_for_delivery', 'delivered']
            ).count(),
            'shipped': base_orders.filter(isPaid=True, isDelivered=False, isCancelled=False, deliveryFailed=False, latest_tracking_status__in=['shipped', 'out_for_delivery']).count(),
            'delivered': base_orders.filter(isDelivered=True, isCancelled=False).count(),
            'failed': base_orders.filter(Q(isCancelled=True) | Q(deliveryFailed=True) | Q(latest_tracking_status__in=['cancelled', 'failed'])).count(),
            'returned': base_orders.filter(has_return_request=True).count(),
        }

        orders = base_orders.order_by('-createdAt')

        if q:
            orders = orders.filter(
                Q(createdBy__email__icontains=q) |
                Q(createdBy__first_name__icontains=q) |
                Q(createdBy__last_name__icontains=q) |
                Q(_id__icontains=q)
            )
        if is_paid == 'true':
            orders = orders.filter(isPaid=True)
        elif is_paid == 'false':
            orders = orders.filter(isPaid=False)
        if is_delivered == 'true':
            orders = orders.filter(isDelivered=True)
        elif is_delivered == 'false':
            orders = orders.filter(isDelivered=False)

        # Status filtering
        if status_filter == 'pending':
            orders = orders.filter(isPaid=False, isCancelled=False, deliveryFailed=False)
        elif status_filter == 'confirmed':
            orders = orders.filter(isPaid=True, isDelivered=False, isCancelled=False, deliveryFailed=False).exclude(
                latest_tracking_status__in=['shipped', 'out_for_delivery', 'delivered']
            )
        elif status_filter == 'shipped':
            orders = orders.filter(isPaid=True, isDelivered=False, isCancelled=False, deliveryFailed=False, latest_tracking_status__in=['shipped', 'out_for_delivery'])
        elif status_filter == 'delivered':
            orders = orders.filter(isDelivered=True, isCancelled=False)
        elif status_filter == 'failed':
            orders = orders.filter(Q(isCancelled=True) | Q(deliveryFailed=True) | Q(latest_tracking_status__in=['cancelled', 'failed']))
        elif status_filter == 'returned':
            orders = orders.filter(has_return_request=True)

        # Paginate
        result = paginate_qs(orders, request, OrderSerializer)
        result['counts'] = counts
        return JsonResponse(result)

    def put(self, request, pk):
        err = check_perm(request.user, MANAGE_ORDERS)
        if err:
            return err
        try:
            order = Order.objects.get(_id=pk)
            data = request.data

            # ── Mark as Paid (with auto-stock deduction) ──
            if 'isPaid' in data:
                was_paid = order.isPaid
                order.isPaid = data['isPaid']
                if data['isPaid'] and not order.paidAt:
                    order.paidAt = datetime.now()
                # Auto-deduct stock when newly paid
                if data['isPaid'] and not was_paid:
                    for item in order.orderitem_set.all():
                        if item.product:
                            item.product.countInStock = max(0, item.product.countInStock - item.qty)
                            item.product.save()
                    OrderTracking.objects.create(
                        order=order, status='confirmed',
                        note='Payment confirmed. Stock auto-deducted.',
                        updated_by=request.user
                    )

            # ── Mark as Delivered ──
            if 'isDelivered' in data:
                order.isDelivered = data['isDelivered']
                if data['isDelivered'] and not order.deliveredAt:
                    order.deliveredAt = datetime.now()
                    OrderTracking.objects.create(
                        order=order, status='delivered',
                        note='Order delivered successfully.',
                        updated_by=request.user
                    )

            # ── Cancel Order (with auto-stock restoration) ──
            if 'isCancelled' in data:
                was_cancelled = order.isCancelled
                order.isCancelled = data['isCancelled']
                if data['isCancelled']:
                    order.isDelivered = False
                    order.deliveryFailed = False
                    # Auto-restore stock when newly cancelled
                    if not was_cancelled:
                        for item in order.orderitem_set.all():
                            if item.product:
                                item.product.countInStock = item.product.countInStock + item.qty
                                item.product.save()
                        OrderTracking.objects.create(
                            order=order, status='cancelled',
                            note='Order cancelled. Stock auto-restored.',
                            updated_by=request.user
                        )

            # ── Delivery Failed ──
            if 'deliveryFailed' in data:
                order.deliveryFailed = data['deliveryFailed']
                if data['deliveryFailed']:
                    order.isDelivered = False
                    order.isCancelled = False
                    OrderTracking.objects.create(
                        order=order, status='failed',
                        note='Delivery attempt failed.',
                        updated_by=request.user
                    )

            order.save()
            return JsonResponse({'detail': 'Order updated', 'data': OrderSerializer(order).data})
        except Order.DoesNotExist:
            return JsonResponse({'detail': 'Order not found'}, status=404)


# ═══════════════════════════════════════════════════════════
#  ORDER TRACKING (manual event addition)
# ═══════════════════════════════════════════════════════════
class AdminOrderTrackingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Get all tracking events for an order."""
        err = check_perm(request.user, MANAGE_ORDERS)
        if err:
            return err
        try:
            order = Order.objects.get(_id=pk)
            events = order.tracking_events.all().order_by('timestamp')
            return JsonResponse({'data': OrderTrackingSerializer(events, many=True).data})
        except Order.DoesNotExist:
            return JsonResponse({'detail': 'Order not found'}, status=404)

    def post(self, request, pk):
        """Add a new tracking event to an order."""
        err = check_perm(request.user, MANAGE_ORDERS)
        if err:
            return err
        try:
            order = Order.objects.get(_id=pk)
            event_status = request.data.get('status')
            note = request.data.get('note', '')

            valid_statuses = [c[0] for c in OrderTracking.STATUS_CHOICES]
            if event_status not in valid_statuses:
                return JsonResponse(
                    {'detail': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                    status=400
                )

            event = OrderTracking.objects.create(
                order=order,
                status=event_status,
                note=note,
                updated_by=request.user
            )

            # Auto-update order flags based on tracking status
            if event_status == 'delivered':
                order.isDelivered = True
                order.deliveredAt = datetime.now()
                order.save()
            elif event_status == 'cancelled':
                if not order.isCancelled:
                    order.isCancelled = True
                    order.isDelivered = False
                    order.deliveryFailed = False
                    # Restore stock
                    for item in order.orderitem_set.all():
                        if item.product:
                            item.product.countInStock = item.product.countInStock + item.qty
                            item.product.save()
                    order.save()

            return JsonResponse({
                'detail': 'Tracking event added',
                'data': OrderTrackingSerializer(event).data
            }, status=201)
        except Order.DoesNotExist:
            return JsonResponse({'detail': 'Order not found'}, status=404)


# ═══════════════════════════════════════════════════════════
#  PRODUCTS (with pagination)
# ═══════════════════════════════════════════════════════════
class AdminProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        err = check_perm(request.user, MANAGE_PRODUCTS)
        if err:
            return err

        if pk:
            try:
                product = Product.objects.get(_id=pk)
                serializer = ProductSerializer(product)
                return JsonResponse({'data': serializer.data})
            except Product.DoesNotExist:
                return JsonResponse({'detail': 'Product not found'}, status=404)

        q = request.GET.get('q', '')
        low_stock = request.GET.get('low_stock', '')
        products = Product.objects.select_related('category').order_by('-createdAt')
        if q:
            products = products.filter(
                Q(name__icontains=q) | Q(brand__icontains=q))
        if low_stock == 'true':
            products = products.filter(countInStock__lte=5)

        # Paginate
        result = paginate_qs(products, request, ProductSerializer)
        return JsonResponse(result)

    def post(self, request):
        err = check_perm(request.user, MANAGE_PRODUCTS)
        if err:
            return err
        data = request.data
        try:
            category = None
            if data.get('category'):
                try:
                    category = Category.objects.get(id=data['category'])
                except Category.DoesNotExist:
                    pass
            product = Product.objects.create(
                name=data.get('name', 'New Product'),
                brand=data.get('brand', ''),
                description=data.get('description', ''),
                price=data.get('price', 0),
                countInStock=data.get('countInStock', 0),
                category=category,
                createdBy=request.user,
            )
            if 'image' in request.FILES:
                product.image = request.FILES['image']
                product.save()
            serializer = ProductSerializer(product)
            return JsonResponse({'detail': 'Product created', 'data': serializer.data},
                                status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)

    def put(self, request, pk):
        err = check_perm(request.user, MANAGE_PRODUCTS)
        if err:
            return err
        try:
            product = Product.objects.get(_id=pk)
            data = request.data
            product.name = data.get('name', product.name)
            product.brand = data.get('brand', product.brand)
            product.description = data.get('description', product.description)
            product.price = data.get('price', product.price)
            product.countInStock = data.get('countInStock', product.countInStock)
            
            # Update category
            if 'category' in data:
                if data['category']:
                    try:
                        product.category = Category.objects.get(id=data['category'])
                    except Category.DoesNotExist:
                        product.category = None
                else:
                    product.category = None

            if 'image' in request.FILES:
                product.image = request.FILES['image']
            product.save()
            return JsonResponse({'detail': 'Product updated', 'data': ProductSerializer(product).data})
        except Product.DoesNotExist:
            return JsonResponse({'detail': 'Product not found'}, status=404)

    def delete(self, request, pk):
        err = check_perm(request.user, MANAGE_PRODUCTS)
        if err:
            return err
        try:
            product = Product.objects.get(_id=pk)
            product.delete()
            return JsonResponse({'detail': 'Product deleted'})
        except Product.DoesNotExist:
            return JsonResponse({'detail': 'Product not found'}, status=404)


class AdminProductStockView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        err = check_perm(request.user, MANAGE_STOCK)
        if err:
            return err
        try:
            product = Product.objects.get(_id=pk)
            stock = request.data.get('countInStock')
            if stock is None:
                return JsonResponse({'detail': 'countInStock is required'}, status=400)
            product.countInStock = int(stock)
            product.save()
            return JsonResponse({'detail': 'Stock updated', 'countInStock': product.countInStock})
        except Product.DoesNotExist:
            return JsonResponse({'detail': 'Product not found'}, status=404)


# ═══════════════════════════════════════════════════════════
#  USERS
# ═══════════════════════════════════════════════════════════
class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        err = check_perm(request.user, MANAGE_USERS)
        if err:
            return err

        if pk:
            try:
                user = User.objects.get(id=pk)
                return JsonResponse({'data': AdminUserSerializer(user).data})
            except User.DoesNotExist:
                return JsonResponse({'detail': 'User not found'}, status=404)

        q = request.GET.get('q', '')
        users = User.objects.prefetch_related(
            'user_roles__role', 'direct_permissions__permission'
        ).order_by('-date_joined')
        if q:
            users = users.filter(
                Q(email__icontains=q) | Q(first_name__icontains=q) |
                Q(last_name__icontains=q) | Q(username__icontains=q))
        serializer = AdminUserSerializer(users, many=True)
        return JsonResponse({'data': serializer.data, 'count': users.count()})

    def put(self, request, pk):
        err = check_perm(request.user, MANAGE_USERS)
        if err:
            return err
        try:
            user = User.objects.get(id=pk)
            data = request.data
            if 'is_active' in data:
                user.is_active = data['is_active']
            if 'is_staff' in data:
                user.is_staff = data['is_staff']
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            user.save()
            return JsonResponse({'detail': 'User updated', 'data': AdminUserSerializer(user).data})
        except User.DoesNotExist:
            return JsonResponse({'detail': 'User not found'}, status=404)


class AdminUserRolesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        err = check_perm(request.user, MANAGE_USERS)
        if err:
            return err
        try:
            user = User.objects.get(id=pk)
            role_id = request.data.get('role_id')
            role = Role.objects.get(id=role_id)
            ur, created = UserRole.objects.get_or_create(
                user=user, role=role,
                defaults={'assigned_by': request.user})
            if not created:
                return JsonResponse({'detail': 'User already has this role'}, status=400)
            return JsonResponse({'detail': f'Role "{role.name}" assigned to {user.email}'})
        except (User.DoesNotExist, Role.DoesNotExist):
            return JsonResponse({'detail': 'User or Role not found'}, status=404)

    def delete(self, request, pk, role_pk):
        err = check_perm(request.user, MANAGE_USERS)
        if err:
            return err
        try:
            ur = UserRole.objects.get(user_id=pk, role_id=role_pk)
            ur.delete()
            return JsonResponse({'detail': 'Role removed'})
        except UserRole.DoesNotExist:
            return JsonResponse({'detail': 'Assignment not found'}, status=404)


class AdminUserPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        err = check_perm(request.user, MANAGE_USERS)
        if err:
            return err
        try:
            user = User.objects.get(id=pk)
            perm_id = request.data.get('permission_id')
            perm = RBACPermission.objects.get(id=perm_id)
            udp, created = UserDirectPermission.objects.get_or_create(
                user=user, permission=perm,
                defaults={'assigned_by': request.user})
            if not created:
                return JsonResponse({'detail': 'User already has this permission'}, status=400)
            return JsonResponse({'detail': f'Permission "{perm.codename}" granted to {user.email}'})
        except (User.DoesNotExist, RBACPermission.DoesNotExist):
            return JsonResponse({'detail': 'User or Permission not found'}, status=404)

    def delete(self, request, pk, perm_pk):
        err = check_perm(request.user, MANAGE_USERS)
        if err:
            return err
        try:
            udp = UserDirectPermission.objects.get(user_id=pk, permission_id=perm_pk)
            udp.delete()
            return JsonResponse({'detail': 'Permission revoked'})
        except UserDirectPermission.DoesNotExist:
            return JsonResponse({'detail': 'Assignment not found'}, status=404)


# ═══════════════════════════════════════════════════════════
#  ROLES
# ═══════════════════════════════════════════════════════════
class AdminRolesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        err = check_perm(request.user, MANAGE_ROLES)
        if err:
            return err

        if pk:
            try:
                role = Role.objects.prefetch_related('permissions').get(id=pk)
                return JsonResponse({'data': RoleSerializer(role).data})
            except Role.DoesNotExist:
                return JsonResponse({'detail': 'Role not found'}, status=404)

        roles = Role.objects.prefetch_related('permissions').annotate(
            users_count=Count('user_roles')).order_by('name')
        return JsonResponse({'data': RoleSerializer(roles, many=True).data})

    def post(self, request):
        err = check_perm(request.user, MANAGE_ROLES)
        if err:
            return err
        serializer = RoleSerializer(data=request.data)
        if serializer.is_valid():
            role = serializer.save()
            return JsonResponse({'detail': 'Role created', 'data': RoleSerializer(role).data},
                                status=201)
        return JsonResponse({'detail': 'Validation error', 'errors': serializer.errors}, status=400)

    def put(self, request, pk):
        err = check_perm(request.user, MANAGE_ROLES)
        if err:
            return err
        try:
            role = Role.objects.get(id=pk)
            data = request.data
            role.name = data.get('name', role.name)
            role.description = data.get('description', role.description)
            role.color = data.get('color', role.color)
            role.save()
            return JsonResponse({'detail': 'Role updated', 'data': RoleSerializer(role).data})
        except Role.DoesNotExist:
            return JsonResponse({'detail': 'Role not found'}, status=404)

    def delete(self, request, pk):
        err = check_perm(request.user, MANAGE_ROLES)
        if err:
            return err
        try:
            role = Role.objects.get(id=pk)
            if role.is_system_role:
                return JsonResponse({'detail': 'System roles cannot be deleted'}, status=400)
            role.delete()
            return JsonResponse({'detail': 'Role deleted'})
        except Role.DoesNotExist:
            return JsonResponse({'detail': 'Role not found'}, status=404)


class AdminRolePermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        err = check_perm(request.user, MANAGE_ROLES)
        if err:
            return err
        try:
            role = Role.objects.get(id=pk)
            perm_id = request.data.get('permission_id')
            perm = RBACPermission.objects.get(id=perm_id)
            role.permissions.add(perm)
            return JsonResponse({'detail': f'Permission "{perm.codename}" added to role "{role.name}"'})
        except (Role.DoesNotExist, RBACPermission.DoesNotExist):
            return JsonResponse({'detail': 'Role or Permission not found'}, status=404)

    def delete(self, request, pk, perm_pk):
        err = check_perm(request.user, MANAGE_ROLES)
        if err:
            return err
        try:
            role = Role.objects.get(id=pk)
            perm = RBACPermission.objects.get(id=perm_pk)
            role.permissions.remove(perm)
            return JsonResponse({'detail': f'Permission removed from role'})
        except (Role.DoesNotExist, RBACPermission.DoesNotExist):
            return JsonResponse({'detail': 'Role or Permission not found'}, status=404)


# ═══════════════════════════════════════════════════════════
#  PERMISSIONS
# ═══════════════════════════════════════════════════════════
class AdminPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        err = check_perm(request.user, MANAGE_PERMISSIONS)
        if err:
            return err

        if pk:
            try:
                perm = RBACPermission.objects.get(id=pk)
                return JsonResponse({'data': RBACPermissionSerializer(perm).data})
            except RBACPermission.DoesNotExist:
                return JsonResponse({'detail': 'Permission not found'}, status=404)

        perms = RBACPermission.objects.annotate(
            roles_count=Count('roles'), direct_count=Count('direct_users')
        ).order_by('category', 'name')
        return JsonResponse({'data': RBACPermissionSerializer(perms, many=True).data})

    def post(self, request):
        err = check_perm(request.user, MANAGE_PERMISSIONS)
        if err:
            return err
        serializer = RBACPermissionSerializer(data=request.data)
        if serializer.is_valid():
            perm = serializer.save()
            return JsonResponse({'detail': 'Permission created',
                                 'data': RBACPermissionSerializer(perm).data}, status=201)
        return JsonResponse({'detail': 'Validation error', 'errors': serializer.errors}, status=400)

    def put(self, request, pk):
        err = check_perm(request.user, MANAGE_PERMISSIONS)
        if err:
            return err
        try:
            perm = RBACPermission.objects.get(id=pk)
            data = request.data
            perm.name = data.get('name', perm.name)
            perm.description = data.get('description', perm.description)
            perm.category = data.get('category', perm.category)
            perm.save()
            return JsonResponse({'detail': 'Permission updated',
                                 'data': RBACPermissionSerializer(perm).data})
        except RBACPermission.DoesNotExist:
            return JsonResponse({'detail': 'Permission not found'}, status=404)

    def delete(self, request, pk):
        err = check_perm(request.user, MANAGE_PERMISSIONS)
        if err:
            return err
        try:
            perm = RBACPermission.objects.get(id=pk)
            perm.delete()
            return JsonResponse({'detail': 'Permission deleted'})
        except RBACPermission.DoesNotExist:
            return JsonResponse({'detail': 'Permission not found'}, status=404)


# ═══════════════════════════════════════════════════════════
#  CURRENT USER PERMISSIONS
# ═══════════════════════════════════════════════════════════
class MyPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        perms = get_user_permissions(user)
        roles = list(UserRole.objects.filter(user=user).select_related('role').values(
            'role__id', 'role__name', 'role__color'))
        return JsonResponse({
            'permissions': perms,
            'roles': roles,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
        })


# ═══════════════════════════════════════════════════════════
#  CATEGORIES
# ═══════════════════════════════════════════════════════════
class AdminCategoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        err = check_perm(request.user, MANAGE_PRODUCTS)
        if err:
            return err
        if pk:
            try:
                category = Category.objects.get(id=pk)
                serializer = CategorySerializer(category)
                return JsonResponse({'data': serializer.data})
            except Category.DoesNotExist:
                return JsonResponse({'detail': 'Category not found'}, status=404)
        
        categories = Category.objects.all().order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return JsonResponse({'data': serializer.data})

    def post(self, request):
        err = check_perm(request.user, MANAGE_PRODUCTS)
        if err:
            return err
        data = request.data
        try:
            parent = None
            if data.get('parent'):
                try:
                    parent = Category.objects.get(id=data['parent'])
                except Category.DoesNotExist:
                    pass
            category = Category.objects.create(
                name=data.get('name'),
                parent=parent,
                attributes_schema=data.get('attributes_schema', {})
            )
            return JsonResponse({'detail': 'Category created', 'data': CategorySerializer(category).data}, status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)

    def put(self, request, pk):
        err = check_perm(request.user, MANAGE_PRODUCTS)
        if err:
            return err
        try:
            category = Category.objects.get(id=pk)
            data = request.data
            category.name = data.get('name', category.name)
            
            if 'parent' in data:
                if data['parent']:
                    try:
                        category.parent = Category.objects.get(id=data['parent'])
                    except Category.DoesNotExist:
                        category.parent = None
                else:
                    category.parent = None
            
            category.attributes_schema = data.get('attributes_schema', category.attributes_schema)
            category.save()
            return JsonResponse({'detail': 'Category updated', 'data': CategorySerializer(category).data})
        except Category.DoesNotExist:
            return JsonResponse({'detail': 'Category not found'}, status=404)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)

    def delete(self, request, pk):
        err = check_perm(request.user, MANAGE_PRODUCTS)
        if err:
            return err
        try:
            category = Category.objects.get(id=pk)
            category.delete()
            return JsonResponse({'detail': 'Category deleted'})
        except Category.DoesNotExist:
            return JsonResponse({'detail': 'Category not found'}, status=404)


class AdminReturnsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        err = check_perm(request.user, MANAGE_ORDERS)
        if err:
            return err

        if pk:
            try:
                ret = ReturnRequest.objects.get(_id=pk)
                serializer = ReturnRequestSerializer(ret)
                return JsonResponse({'data': serializer.data})
            except ReturnRequest.DoesNotExist:
                return JsonResponse({'detail': 'Return request not found'}, status=404)

        # Filters
        status_filter = request.GET.get('status', '')
        q = request.GET.get('q', '')

        queryset = ReturnRequest.objects.all().order_by('-createdAt')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if q:
            queryset = queryset.filter(
                Q(createdBy__email__icontains=q) |
                Q(createdBy__first_name__icontains=q) |
                Q(createdBy__last_name__icontains=q) |
                Q(order___id__icontains=q) |
                Q(_id__icontains=q)
            )

        result = paginate_qs(queryset, request, ReturnRequestSerializer)
        return JsonResponse(result)

    def put(self, request, pk):
        err = check_perm(request.user, MANAGE_ORDERS)
        if err:
            return err

        try:
            return_request = ReturnRequest.objects.get(_id=pk)
        except ReturnRequest.DoesNotExist:
            return JsonResponse({'detail': 'Return request not found'}, status=404)

        data = request.data
        old_status = return_request.status
        new_status = data.get('status', old_status)

        valid_statuses = [choice[0] for choice in ReturnRequest.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return JsonResponse({'detail': f'Invalid status. Allowed: {valid_statuses}'}, status=400)

        # Atomic stock update & tracking creation if completed
        try:
            with transaction.atomic():
                return_request.status = new_status
                return_request.admin_comment = data.get('admin_comment', return_request.admin_comment)
                return_request.save()

                if new_status == 'completed' and old_status != 'completed':
                    for return_item in return_request.return_items.all():
                        order_item = return_item.order_item
                        if order_item.product:
                            # 1. Base product stock
                            order_item.product.countInStock += return_item.qty
                            order_item.product.save()

                            # 2. Variant stock if matches name pattern
                            if order_item.name and " - " in order_item.name:
                                parts = order_item.name.split(" - ", 1)
                                if len(parts) > 1:
                                    variant_name = parts[1]
                                    try:
                                        variant = ProductVariant.objects.get(product=order_item.product, name=variant_name)
                                        variant.countInStock += return_item.qty
                                        variant.save()
                                    except ProductVariant.DoesNotExist:
                                        pass

                    # Create Order Tracking Event
                    OrderTracking.objects.create(
                        order=return_request.order,
                        status='processing',
                        note=f"Return request #{return_request._id} completed & refunded. Stock restored.",
                        updated_by=request.user
                    )
                elif new_status == 'approved' and old_status != 'approved':
                    # Log event
                    OrderTracking.objects.create(
                        order=return_request.order,
                        status='processing',
                        note=f"Return request #{return_request._id} approved by admin.",
                        updated_by=request.user
                    )
                elif new_status == 'rejected' and old_status != 'rejected':
                    # Log event
                    OrderTracking.objects.create(
                        order=return_request.order,
                        status='processing',
                        note=f"Return request #{return_request._id} rejected by admin.",
                        updated_by=request.user
                    )

            return JsonResponse({'detail': 'Return request updated', 'data': ReturnRequestSerializer(return_request).data})
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)
