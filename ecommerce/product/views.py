from django.shortcuts import render
from .products import products
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import *
from .serializers import *
from typing import Any, Dict, Optional, Type, TypeVar
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.hashers import make_password
from rest_framework import status

# Create your views here.

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        data = super().validate(attrs)
        serializers= UserSerializerWithToken(self.user).data
        for k,v in serializers.items():
            data[k]=v
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class=MyTokenObtainPairSerializer


class UserProfileView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        elif self.request.method=='PUT':
            return [IsAuthenticated()]
        
    def get(self, request):
        user= request.user
        if user is not None:           
            serializerData= UserSerializer(user, many=False)
            return Response(serializerData.data, status=status.HTTP_200_OK)
        return JsonResponse({"status":status.HTTP_400_BAD_REQUEST, "detail":"Username is null"})
    
    def put(self, request):
        user = request.user
        data = request.data

        if user is not None:
            if not data:
                return Response(
                    {"detail": "No data provided to update the profile."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                # Helper function to get valid field values
                def get_valid_value(field, current_value):
                    value = data.get(field, None)
                    return value if value is not None and value.strip() else current_value

                # Update user fields
                user.first_name = get_valid_value('first_name', user.first_name)
                user.last_name = get_valid_value('last_name', user.last_name)
                user.email = get_valid_value('email', user.email)
                user.username = get_valid_value('username', user.username)

                if data.get('password') and data.get('password').strip():
                    user.password = make_password(data['password'])

                user.save()

                serializer = UserSerializerWithToken(user, many=False)
                return Response(
                    {
                        "detail": "Your profile updated successfully.",
                        "data": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

            except Exception as e:
                return Response(
                    {"detail": f"An error occurred: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"detail": "Authentication required to update user details."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
class UserView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAdminUser()]
        
    def get(self, request):
        user=User.objects.all()         
        serializerData= UserSerializer(user, many=True)
        return Response(serializerData.data)
    
class RegisterUser(APIView):
    def post(self, request):
        data = request.data
        try:
            user = User.objects.create(
                first_name=data['first_name'],
                last_name=data['last_name'],
                username=data['email'],
                email=data['email'],
                password=make_password(data['password'])
            )
            serializer = UserSerializerWithToken(user, many=False)
            return JsonResponse({
                'detail': 'Registration successful',
                'status': status.HTTP_200_OK,
                'data': serializer.data
            })
        except Exception as e:
            return JsonResponse({
                'detail': f"Something's wrong: {str(e)}",
                'status': status.HTTP_400_BAD_REQUEST
            })


from rest_framework.pagination import PageNumberPagination

def get_subcategory_ids(category_obj):
    ids = [category_obj.id]
    for sub in category_obj.subcategories.all():
        ids.extend(get_subcategory_ids(sub))
    return ids

class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductView(APIView):
    def get(self, request, pk=None):
        if pk is not None:
            try:
                product = Product.objects.select_related('category', 'vendor', 'createdBy').prefetch_related('variants', 'variants__images', 'review_set').get(_id=pk)
                serializerData = ProductSerializer(product, many=False, context={'request': request})
                return Response(serializerData.data)
            except Product.DoesNotExist:
                return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Optimize N+1 queries by selecting and prefetching relationships
        products = Product.objects.all().select_related('category', 'vendor', 'createdBy').prefetch_related('variants', 'variants__images', 'review_set')
        
        # 1. Text Search Keyword
        query = request.query_params.get('keyword')
        if query:
            products = products.filter(name__icontains=query)
            
        # 2. Recursive Category Filter
        category_filter = request.query_params.get('category')
        if category_filter:
            try:
                # Find by exact name first
                category_obj = Category.objects.prefetch_related('subcategories').get(name__iexact=category_filter)
                sub_ids = get_subcategory_ids(category_obj)
                products = products.filter(category_id__in=sub_ids)
            except Category.DoesNotExist:
                # If not found by name, try filtering by integer ID if passed
                if category_filter.isdigit():
                    try:
                        category_obj = Category.objects.prefetch_related('subcategories').get(id=category_filter)
                        sub_ids = get_subcategory_ids(category_obj)
                        products = products.filter(category_id__in=sub_ids)
                    except Category.DoesNotExist:
                        products = products.none()
                else:
                    products = products.none()

        # 3. Price Range Filtering
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)

        # 4. Vendor Filtering
        vendor_filter = request.query_params.get('vendor')
        if vendor_filter:
            if vendor_filter.isdigit():
                products = products.filter(vendor_id=vendor_filter)
            else:
                products = products.filter(vendor__name__icontains=vendor_filter)

        # 5. Dynamic Attributes inside JSONField
        # Any query param that is not one of the standard params is parsed as a JSONField attribute filter.
        standard_params = ['keyword', 'category', 'min_price', 'max_price', 'vendor', 'sort_by', 'page', 'page_size']
        for key, value in request.query_params.items():
            if key not in standard_params and value:
                # E.g. filter by attributes__color = value
                filter_kwargs = {f'attributes__{key}__iexact': value}
                products = products.filter(**filter_kwargs)

        # 6. Sorting
        sort_by = request.query_params.get('sort_by')
        if sort_by == 'price_asc':
            products = products.order_by('price')
        elif sort_by == 'price_desc':
            products = products.order_by('-price')
        elif sort_by == 'newest':
            products = products.order_by('-createdAt')
        elif sort_by == 'popularity':
            products = products.order_by('-numReviews', '-rating')
        else:
            products = products.order_by('-createdAt') # Default newest

        # 7. Pagination
        paginator = ProductPagination()
        page = paginator.paginate_queryset(products, request)
        if page is not None:
            serializer = ProductSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class CreateProductReview(APIView):
    def get_permissions(self):
        return [IsAuthenticated()]

    def post(self, request, pk):
        user = request.user
        try:
            product = Product.objects.get(_id=pk)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
            
        data = request.data

        # 1 - Review already exists
        from orders.models import Review, OrderItem
        alreadyExists = Review.objects.filter(product=product, createdBy=user).exists()
        if alreadyExists:
            return Response({'detail': 'Product already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

        # 1.5 - User must have ordered the product to review it
        hasOrdered = OrderItem.objects.filter(
            order__createdBy=user,
            product=product,
            order__isCancelled=False
        ).exists()
        if not hasOrdered:
            return Response({'detail': 'You can only review products that you have ordered.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2 - No Rating or 0 rating
        rating = data.get('rating')
        if not rating or int(rating) == 0:
            return Response({'detail': 'Please select a rating'}, status=status.HTTP_400_BAD_REQUEST)

        # 3 - Create Review
        name = user.first_name + ' ' + user.last_name
        if not name.strip():
            name = user.username or user.email
            
        review = Review.objects.create(
            createdBy=user,
            product=product,
            name=name,
            rating=int(rating),
            comment=data.get('comment', ''),
        )

        reviews = Review.objects.filter(product=product)
        product.numReviews = reviews.count()

        total = sum([r.rating for r in reviews])
        product.rating = total / reviews.count()
        product.save()

        return Response({'detail': 'Review added successfully'}, status=status.HTTP_201_CREATED)


class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TopProductsView(APIView):
    def get(self, request):
        products = Product.objects.filter(rating__gte=4).order_by('-rating')[:5]
        if not products.exists():
            products = Product.objects.all()[:5]
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
