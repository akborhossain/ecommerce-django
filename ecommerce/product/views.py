from django.shortcuts import render
from .products import products
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *
from typing import Any, Dict, Optional, Type, TypeVar
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
# Create your views here.

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        data = super().validate(attrs)
        data['username']=self.user.username
        data['email']=self.user.email
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class=MyTokenObtainPairSerializer
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
