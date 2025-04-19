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

class OrderView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        if self.request.method == 'GET':
            return [IsAuthenticated()]
    def post(self, request):
        user=request.user
        data=request.data
        orderItems= data['orderItems']
        print(orderItems)
        if orderItems and len(orderItems)==0:
            return JsonResponse({"status":status.HTTP_400_BAD_REQUEST, "detail":"There is no product item for order"})
        else:
            order =Order.objects.create(
                createdBy=user,
                paymentMethod=data['paymentMethod'],
                taxPrice=0.0,
                shippingPrice=data['shippingCost'],
                totalPrice=data['totalPrice']
            )

            shipping= ShippingAddress.objects.create(
                order=order,
                address=data['shippingAddress']['address'],
                union=data['shippingAddress']['union'],
                postOffice=data['shippingAddress']['postOffice'],
                postalCode=data['shippingAddress']['postalCode'],
                policeStation=data['shippingAddress']['policeStation'],
                district=data['shippingAddress']['district'],
                division=data['shippingAddress']['division'],
                country="Bangladesh",
            )
            for i in orderItems:
                product= Product.objects.get(_id=i['product'])
                item=OrderItem.objects.create(
                    product=product,
                    order= order,
                    name=product.name,
                    qty=i['qty'],
                    price=i['price'],
                    image=product.image.url,
                )
                product.countInStock-=item.qty
                product.save()

            
            serializer= OrderSerializer(order, many=False)

            return JsonResponse({"status":status.HTTP_200_OK, "detail":"Order is created successfull", "data":serializer.data})
        
    def get(self, request, pk=None):
        user=request.user
        print(user)
        if pk is not None:
            try:
                order =Order.objects.get(_id=pk)              
                if user.is_staff or order.createdBy == user:
                    serializer = OrderSerializer(order, many=False)
                    return JsonResponse({ "status":status.HTTP_200_OK, "detail": "Order get successfully", "data": serializer.data })
                else:
                    return JsonResponse({ "status":status.HTTP_400_BAD_REQUEST, "detail": "Not authorized to view this order" })
            except:
                return JsonResponse({ "status":status.HTTP_400_BAD_REQUEST, "detail": "Order is not exist!" })
        else:
            try:
                orders = Order.objects.filter(createdBy=user)           
                serializer = OrderSerializer(orders, many=True)
                return JsonResponse({"status": status.HTTP_200_OK,"detail": "Orders retrieved successfully","data": serializer.data})
            except:
                return JsonResponse({"status": status.HTTP_400_BAD_REQUEST, "detail": "No orders found for this user"})
            
    def put(self, request, pk=None):
        user=request.user
        if pk is not None:
            order= Order.objects.get(_id=pk)
            if order.createdBy==user:
                order.isPaid=True
                order.paidAt= datetime.now()
                order.save()
                return JsonResponse({"status": status.HTTP_200_OK, "detail": "Order update successfully"})

            
        
