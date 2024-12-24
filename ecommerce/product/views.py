from django.shortcuts import render
from .products import products
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *
# Create your views here.

class UserProfileView(APIView):
    def get(self, request):
        user= request.user
        if user is not None:           
            serializerData= UserSerializer(user, many=False)
            return Response(serializerData.data)
        return JsonResponse({"status":400, "message":"Username is null"})


class ProductView(APIView):
    def get(self, request, pk=None):
        if pk is not None:
            product=Product.objects.get(_id=pk)
            serializerData=ProductSerializer(product, many=False)
            return Response(serializerData.data)
        products=Product.objects.all()
        serializerData=ProductSerializer(products, many=True)

        return Response(serializerData.data)
