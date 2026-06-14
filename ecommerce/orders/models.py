from django.db import models
from django.contrib.auth.models import User

from product.models import Product

# Create your models here.

class Review(models.Model):

    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    createdBy = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    rating = models.IntegerField(null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return str(self.rating)
    


class Order(models.Model):

    _id=models.AutoField(primary_key=True, editable=False)
    paymentMethod=models.CharField(max_length=200, blank=True, null=True)
    taxPrice=models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    shippingPrice =models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    totalPrice = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    isPaid = models.BooleanField(default=False)
    paidAt=models.DateTimeField(auto_now_add=False, blank=True, null=True)
    isDelivered=models.BooleanField(default=False)
    deliveredAt=models.DateTimeField(auto_now_add=False, blank=True, null=True)
    isCancelled = models.BooleanField(default=False)
    deliveryFailed = models.BooleanField(default=False)
    createdAt=models.DateTimeField(auto_now_add=True)
    createdBy=models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return str(self._id)
    
class OrderItem(models.Model):
    product=models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    order=models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
    name=models.CharField(max_length=200, null=True, blank=True)
    qty=models.IntegerField(null=True, blank=True, default=0)
    price= models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    image=models.CharField(max_length=200, null=True, blank=True)
    _id=models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return str(self.name)
    
class ShippingAddress(models.Model):
    order= models.OneToOneField(Order, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    address=models.CharField(max_length=500, null=True, blank=True)
    union= models.CharField(max_length=200, null=True, blank=True)
    postOffice=models.CharField(max_length=200, null=True, blank=True)
    postalCode=models.CharField(max_length=50, null=True, blank=True)
    policeStation=models.CharField(max_length=200, null=True, blank=True)
    district=models.CharField(max_length=200, null=True, blank=True)
    division=models.CharField(max_length=200, null=True, blank=True)
    country=models.CharField(max_length=200, null=True, blank=True)
    phoneNumber = models.CharField(max_length=200, null=True, blank=True)
    shippingPrice=models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    _id=models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return str(self.address)


class OrderTracking(models.Model):
    STATUS_CHOICES = [
        ('placed', 'Order Placed'),
        ('confirmed', 'Order Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('failed', 'Delivery Failed'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='tracking_events')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES)
    note = models.TextField(blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Order #{self.order._id} - {self.get_status_display()}"


class UserAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    address = models.CharField(max_length=500, null=True, blank=True)
    union = models.CharField(max_length=200, null=True, blank=True)
    postOffice = models.CharField(max_length=200, null=True, blank=True)
    postalCode = models.CharField(max_length=50, null=True, blank=True)
    policeStation = models.CharField(max_length=200, null=True, blank=True)
    district = models.CharField(max_length=200, null=True, blank=True)
    division = models.CharField(max_length=200, null=True, blank=True)
    country = models.CharField(max_length=200, default='Bangladesh')
    phoneNumber = models.CharField(max_length=200, null=True, blank=True)
    isDefault = models.BooleanField(default=False)
    _id = models.AutoField(primary_key=True, editable=False)

    def __str__(self):
        return str(self.address)


class ReturnRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Return Requested'),
        ('approved', 'Return Approved'),
        ('rejected', 'Return Rejected'),
        ('completed', 'Return Completed & Refunded'),
    ]
    REASON_CHOICES = [
        ('defective', 'Defective / Damaged product'),
        ('wrong_item', 'Received wrong item'),
        ('unsatisfied', 'Not as expected / unsatisfied'),
        ('size_fit', 'Size or fit issue'),
        ('other', 'Other reason'),
    ]
    
    _id = models.AutoField(primary_key=True, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='return_requests')
    createdBy = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    reason_detail = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_comment = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Return Request #{self._id} for Order #{self.order._id}"


class ReturnItem(models.Model):
    _id = models.AutoField(primary_key=True, editable=False)
    return_request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE, related_name='return_items')
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE)
    qty = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.qty}x {self.order_item.name} in Return Request #{self.return_request._id}"