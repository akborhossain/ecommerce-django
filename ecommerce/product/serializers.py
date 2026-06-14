from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from orders.models import Review


class UserSerializer(serializers.ModelSerializer):
    name= serializers.SerializerMethodField(read_only=True)
    _id=serializers.SerializerMethodField(read_only=True)
    class Meta:
        model= User
        fields=['id','_id', 'first_name', 'last_name', 'username', 'email', 'name', 'is_staff']

    def get_name(self,obj):
        name = obj.first_name +" "+ obj.last_name
        if name==" ":
            name= obj.username
        return name
    def get__id(self, obj):
        _id=obj.id
        return _id
    
class UserSerializerWithToken(UserSerializer):
    token=serializers.SerializerMethodField(read_only=True)
    class Meta:
        model=User
        fields=['id','_id', 'username', 'email', 'name', 'is_staff', 'token']
    def get_token(self,obj):
        token=RefreshToken.for_user(obj)
        return str(token.access_token)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'attributes_schema']


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'name', 'description', 'createdAt']


class ProductVariantImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariantImage
        fields = ['id', 'image']


class ProductVariantSerializer(serializers.ModelSerializer):
    images = ProductVariantImageSerializer(many=True, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'sku', 'price', 'countInStock', 'attributes', 'images']


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField(read_only=True)
    category_details = CategorySerializer(source='category', read_only=True)
    vendor = VendorSerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField(read_only=True)
    has_purchased = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_category(self, obj):
        return obj.category.name if obj.category else ""

    def get_reviews(self, obj):
        # Prevent circular or runtime issues if review_set does not exist
        if hasattr(obj, 'review_set'):
            reviews = obj.review_set.all()
            serializer = ReviewSerializer(reviews, many=True)
            return serializer.data
        return []

    def get_has_purchased(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        if user and user.is_authenticated:
            from orders.models import OrderItem
            return OrderItem.objects.filter(order__createdBy=user, product=obj, order__isCancelled=False).exists()
        return False