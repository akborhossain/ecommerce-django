from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from product.serializers import *


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields='__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields='__all__'


class OrderSerializer(serializers.ModelSerializer):
    orderItems= serializers.SerializerMethodField(read_only=True)
    shippingAddress= serializers.SerializerMethodField(read_only=True)
    createdBy= serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Order
        fields='__all__'
    
    def get_orderItems(self, obj):
        items= obj.orderitem_set.all()
        serializer = OrderItemSerializer(items, many=True)
        return serializer.data
    def get_shippingAddress(self, obj):
        try:
            address=ShippingAddressSerializer(obj.shippingAddress, many=False)
        except:
            address =False
        return address
    
    def get_createdBy(self, obj):
        createdBy= obj.createdBy
        serializer = UserSerializer(createdBy, many=False)
        return serializer.data    