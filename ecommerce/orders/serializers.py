from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from .models import OrderTracking
from product.serializers import *


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields='__all__'


class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields='__all__'


class OrderTrackingSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderTracking
        fields = ['id', 'status', 'status_display', 'note', 'timestamp', 'updated_by', 'updated_by_name']

    def get_updated_by_name(self, obj):
        if obj.updated_by:
            return obj.updated_by.get_full_name() or obj.updated_by.username
        return 'System'


class ReturnItemSerializer(serializers.ModelSerializer):
    order_item_name = serializers.CharField(source='order_item.name', read_only=True)
    order_item_price = serializers.DecimalField(source='order_item.price', max_digits=7, decimal_places=2, read_only=True)
    order_item_image = serializers.CharField(source='order_item.image', read_only=True)
    product_id = serializers.IntegerField(source='order_item.product._id', read_only=True)

    class Meta:
        model = ReturnItem
        fields = ['_id', 'return_request', 'order_item', 'qty', 'order_item_name', 'order_item_price', 'order_item_image', 'product_id']


class ReturnRequestSerializer(serializers.ModelSerializer):
    return_items = ReturnItemSerializer(many=True, read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    customer_email = serializers.CharField(source='createdBy.email', read_only=True)
    customer_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ReturnRequest
        fields = [
            '_id', 'order', 'createdBy', 'reason', 'reason_display', 
            'reason_detail', 'status', 'status_display', 'admin_comment', 
            'return_items', 'customer_email', 'customer_name',
            'createdAt', 'updatedAt'
        ]

    def get_customer_name(self, obj):
        try:
            if obj.order.shippingaddress and obj.order.shippingaddress.name:
                return obj.order.shippingaddress.name
        except:
            pass
        if obj.createdBy:
            return obj.createdBy.get_full_name() or obj.createdBy.username
        return 'Unknown'


class OrderSerializer(serializers.ModelSerializer):
    orderItems= serializers.SerializerMethodField(read_only=True)
    shippingAddress= serializers.SerializerMethodField(read_only=True)
    createdBy= serializers.SerializerMethodField(read_only=True)
    tracking = serializers.SerializerMethodField(read_only=True)
    return_requests = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Order
        fields='__all__'
    
    def get_orderItems(self, obj):
        items= obj.orderitem_set.all()
        serializer = OrderItemSerializer(items, many=True)
        return serializer.data
    def get_shippingAddress(self, obj):
        try:
            address=ShippingAddressSerializer(obj.shippingaddress, many=False).data
        except:
            address =False
        return address
    
    def get_createdBy(self, obj):
        createdBy= obj.createdBy
        serializer = UserSerializer(createdBy, many=False)
        return serializer.data

    def get_tracking(self, obj):
        events = obj.tracking_events.all().order_by('timestamp')
        return OrderTrackingSerializer(events, many=True).data

    def get_return_requests(self, obj):
        requests = obj.return_requests.all().order_by('-createdAt')
        return ReturnRequestSerializer(requests, many=True).data