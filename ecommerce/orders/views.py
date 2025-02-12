from django.shortcuts import render
from .products import products
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from product.models import *
from product.serializers import *
from .serializers import *
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

            return JsonResponse({"status":status.HTTP_200_OK, "detail":"Order is successfull", "data":serializer.data})