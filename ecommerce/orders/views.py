from django.shortcuts import render
from .products import products
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from product.models import *
from product.serializers import *
from rest_framework import status
# Create your views here.

class Order(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
    def post(self, request):
        user=request.user
        data=request.data
        orderItems= data['orderItems']

        if orderItems and len(orderItems)==0:
            return JsonResponse({"status":status.HTTP_400_BAD_REQUEST, "detail":"There is no product item for order"})
        else:
            order =Order.objects.create(
                user=user,
                paymentMethod=data['paymentMethod'],
                taxPrice=0.0,
                shippingPrice=data['shippingPrice'],
                totalPrice=data['totalPrice']
            )

        return JsonResponse({"status":status.HTTP_200_OK, "detail":"Username is null"})