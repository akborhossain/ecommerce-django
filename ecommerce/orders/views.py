from django.shortcuts import render
from product.products import products
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from product.models import *
from product.serializers import *
from .serializers import *
from rest_framework import status
from datetime import datetime

# Create your views here.

from django.db import transaction
from .tasks import send_order_email_task, notify_vendor_task

class OrderView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        if self.request.method == 'GET':
            return [IsAuthenticated()]

    def post(self, request):
        user = request.user
        data = request.data
        orderItems = data.get('orderItems', [])
        
        if not orderItems or len(orderItems) == 0:
            return JsonResponse({"detail": "There is no product item for order"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                order = Order.objects.create(
                    createdBy=user,
                    paymentMethod=data['paymentMethod'],
                    taxPrice=0.0,
                    shippingPrice=data['shippingCost'],
                    totalPrice=data['totalPrice']
                )

                shipping = ShippingAddress.objects.create(
                    order=order,
                    name=data['shippingAddress'].get('name', ''),
                    address=data['shippingAddress'].get('address', ''),
                    union=data['shippingAddress'].get('union', ''),
                    postOffice=data['shippingAddress'].get('postOffice', ''),
                    postalCode=data['shippingAddress'].get('postalCode', ''),
                    policeStation=data['shippingAddress'].get('policeStation', ''),
                    district=data['shippingAddress'].get('district', ''),
                    division=data['shippingAddress'].get('division', ''),
                    country=data['shippingAddress'].get('country', 'Bangladesh'),
                    phoneNumber=data['shippingAddress'].get('phoneNumber', ''),
                )
                
                for i in orderItems:
                    variant_id = i.get('variant')
                    product_id = i['product']
                    
                    # Fetch and lock base product row
                    product = Product.objects.select_for_update().get(_id=product_id)
                    
                    if variant_id:
                        # Fetch and lock product variant row
                        variant = ProductVariant.objects.select_for_update().get(id=variant_id)
                        if variant.countInStock < i['qty']:
                            raise Exception(f"Insufficient stock for variant {variant.name}")
                        variant.countInStock -= i['qty']
                        variant.save()
                        
                        item_price = variant.price
                        item_name = f"{product.name} - {variant.name}"
                        
                        # Decrement base product fallback stock
                        product.countInStock = max(0, product.countInStock - i['qty'])
                        product.save()
                    else:
                        if product.countInStock < i['qty']:
                            raise Exception(f"Insufficient stock for product {product.name}")
                        product.countInStock -= i['qty']
                        product.save()
                        item_price = i['price']
                        item_name = product.name

                    OrderItem.objects.create(
                        product=product,
                        order=order,
                        name=item_name,
                        qty=i['qty'],
                        price=item_price,
                        image=product.image.url if product.image else '/images/placeholder.png',
                    )
            
            # Dispatch Celery tasks outside transaction block (optional — gracefully degrade if Redis is down)
            try:
                send_order_email_task.delay(order._id, user.email)
                notify_vendor_task.delay(order._id)
            except Exception as celery_err:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(
                    f"Celery task dispatch failed (Redis may not be running). "
                    f"Order {order._id} was saved successfully. Error: {str(celery_err)}"
                )

            serializer = OrderSerializer(order, many=False)
            return JsonResponse({"detail": "Order is created successfully", "data": serializer.data}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return JsonResponse({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, pk=None):
        user=request.user
        if pk is not None:
            try:
                order =Order.objects.get(_id=pk)              
                if user.is_staff or order.createdBy == user:
                    serializer = OrderSerializer(order, many=False)
                    return JsonResponse({ "detail": "Order retrieved successfully", "data": serializer.data }, status=status.HTTP_200_OK)
                else:
                    return JsonResponse({ "detail": "Not authorized to view this order" }, status=status.HTTP_403_FORBIDDEN)
            except Order.DoesNotExist:
                return JsonResponse({ "detail": "Order does not exist!" }, status=status.HTTP_404_NOT_FOUND)
        else:
            try:
                orders = Order.objects.filter(createdBy=user)           
                serializer = OrderSerializer(orders, many=True)
                return JsonResponse({"detail": "Orders retrieved successfully","data": serializer.data}, status=status.HTTP_200_OK)
            except Exception as e:
                return JsonResponse({"detail": f"An error occurred: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class OrderPayView(APIView):
    def get_permissions(self):
        return [IsAuthenticated()]

    def put(self, request, pk):
        try:
            order = Order.objects.get(_id=pk)
            order.isPaid = True
            order.paidAt = datetime.now()
            order.save()
            return JsonResponse({"detail": "Order was paid successfully"}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return JsonResponse({"detail": "Order does not exist"}, status=status.HTTP_404_NOT_FOUND)


class OrderDeliverView(APIView):
    def get_permissions(self):
        return [IsAdminUser()]

    def put(self, request, pk):
        try:
            order = Order.objects.get(_id=pk)
            order.isDelivered = True
            order.deliveredAt = datetime.now()
            order.save()
            return JsonResponse({"detail": "Order was marked as delivered successfully"}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return JsonResponse({"detail": "Order does not exist"}, status=status.HTTP_404_NOT_FOUND)


class UserAddressView(APIView):
    def get_permissions(self):
        return [IsAuthenticated()]

    def get(self, request):
        user = request.user
        addresses = UserAddress.objects.filter(user=user)
        serializer = UserAddressSerializer(addresses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        data = request.data
        
        is_default = data.get('isDefault', False)
        if is_default:
            UserAddress.objects.filter(user=user).update(isDefault=False)
            
        if not UserAddress.objects.filter(user=user).exists():
            is_default = True

        address = UserAddress.objects.create(
            user=user,
            name=data.get('name'),
            address=data.get('address'),
            union=data.get('union'),
            postOffice=data.get('postOffice'),
            postalCode=data.get('postalCode'),
            policeStation=data.get('policeStation'),
            district=data.get('district'),
            division=data.get('division'),
            country=data.get('country', 'Bangladesh'),
            phoneNumber=data.get('phoneNumber'),
            isDefault=is_default
        )
        
        serializer = UserAddressSerializer(address, many=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, pk):
        user = request.user
        try:
            address = UserAddress.objects.get(_id=pk, user=user)
            data = request.data

            address.name = data.get('name', address.name)
            address.address = data.get('address', address.address)
            address.union = data.get('union', address.union)
            address.postOffice = data.get('postOffice', address.postOffice)
            address.postalCode = data.get('postalCode', address.postalCode)
            address.policeStation = data.get('policeStation', address.policeStation)
            address.district = data.get('district', address.district)
            address.division = data.get('division', address.division)
            address.country = data.get('country', address.country)
            address.phoneNumber = data.get('phoneNumber', address.phoneNumber)

            is_default = data.get('isDefault', address.isDefault)
            if is_default and not address.isDefault:
                UserAddress.objects.filter(user=user).update(isDefault=False)
                address.isDefault = True
            elif not is_default and address.isDefault:
                address.isDefault = False

            address.save()
            serializer = UserAddressSerializer(address, many=False)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserAddress.DoesNotExist:
            return Response({'detail': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        user = request.user
        try:
            address = UserAddress.objects.get(_id=pk, user=user)
            was_default = address.isDefault
            address.delete()
            
            if was_default:
                remaining = UserAddress.objects.filter(user=user).first()
                if remaining:
                    remaining.isDefault = True
                    remaining.save()
                    
            return Response({'detail': 'Address deleted successfully'}, status=status.HTTP_200_OK)
        except UserAddress.DoesNotExist:
            return Response({'detail': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)


class ReturnRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        try:
            order = Order.objects.get(_id=pk)
        except Order.DoesNotExist:
            return JsonResponse({"detail": "Order does not exist"}, status=404)

        if not (user.is_staff or order.createdBy == user):
            return JsonResponse({"detail": "Not authorized to return items from this order"}, status=403)

        if not order.isDelivered:
            return JsonResponse({"detail": "Only delivered orders can be returned"}, status=400)

        if order.isCancelled:
            return JsonResponse({"detail": "Cancelled orders cannot be returned"}, status=400)

        data = request.data
        reason = data.get('reason')
        reason_detail = data.get('reason_detail', '')
        items = data.get('items', [])

        if not reason:
            return JsonResponse({"detail": "Return reason is required"}, status=400)

        valid_reasons = [choice[0] for choice in ReturnRequest.REASON_CHOICES]
        if reason not in valid_reasons:
            return JsonResponse({"detail": f"Invalid reason code. Allowed: {valid_reasons}"}, status=400)

        if not items or len(items) == 0:
            return JsonResponse({"detail": "No items specified for return"}, status=400)

        try:
            with transaction.atomic():
                return_request = ReturnRequest.objects.create(
                    order=order,
                    createdBy=user,
                    reason=reason,
                    reason_detail=reason_detail,
                    status='pending'
                )

                for item in items:
                    order_item_id = item.get('order_item_id')
                    qty = int(item.get('qty', 1))

                    if qty <= 0:
                        raise Exception("Return quantity must be greater than zero")

                    try:
                        order_item = OrderItem.objects.get(_id=order_item_id, order=order)
                    except OrderItem.DoesNotExist:
                        raise Exception(f"Order item {order_item_id} does not belong to this order")

                    # Check previous return requests (excluding rejected ones)
                    from django.db.models import Sum
                    prev_returned = ReturnItem.objects.filter(
                        order_item=order_item,
                        return_request__status__in=['pending', 'approved', 'completed']
                    ).aggregate(total=Sum('qty'))['total'] or 0

                    if prev_returned + qty > order_item.qty:
                        raise Exception(
                            f"Cannot return {qty} of item '{order_item.name}'. "
                            f"Ordered: {order_item.qty}, Already returned/requested: {prev_returned}"
                        )

                    ReturnItem.objects.create(
                        return_request=return_request,
                        order_item=order_item,
                        qty=qty
                    )

                # Add a tracking event
                OrderTracking.objects.create(
                    order=order,
                    status='processing',
                    note=f"Return request #{return_request._id} submitted for items.",
                    updated_by=user
                )

            serializer = ReturnRequestSerializer(return_request, many=False)
            return JsonResponse({"detail": "Return request submitted successfully", "data": serializer.data}, status=201)

        except Exception as e:
            return JsonResponse({"detail": str(e)}, status=400)

    def get(self, request, pk):
        # Retrieve all return requests for this order
        user = request.user
        try:
            order = Order.objects.get(_id=pk)
        except Order.DoesNotExist:
            return JsonResponse({"detail": "Order does not exist"}, status=404)

        if not (user.is_staff or order.createdBy == user):
            return JsonResponse({"detail": "Not authorized to view return requests for this order"}, status=403)

        requests = ReturnRequest.objects.filter(order=order).order_by('-createdAt')
        serializer = ReturnRequestSerializer(requests, many=True)
        return JsonResponse({"detail": "Return requests retrieved successfully", "data": serializer.data})

            
        
