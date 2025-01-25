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
            return Response(serializerData.data)
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
                        "message": "Your profile updated successfully.",
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


class ProductView(APIView):
    def get(self, request, pk=None):
        if pk is not None:
            product=Product.objects.get(_id=pk)
            serializerData=ProductSerializer(product, many=False)
            return Response(serializerData.data)
        products=Product.objects.all()
        serializerData=ProductSerializer(products, many=True)

        return Response(serializerData.data)
