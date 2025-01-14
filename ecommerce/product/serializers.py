from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *


class UserSerializer(serializers.ModelSerializer):
    name= serializers.SerializerMethodField(read_only=True)
    class Meta:
        model= User
        fields=['id', 'username', 'email', 'name', 'is_staff']

    def get_name(self,obj):
        name = obj.first_name +" "+ obj.last_name
        if name==" ":
            name= obj.username
        return name
    
class UserSerializerWithToken(UserSerializer):
    token=serializers.SerializerMethodField(read_only=True)
    class Meta:
        model=User
        fields=['id', 'username', 'email', 'name', 'is_staff', 'token']
    def get_token(self,obj):
        token=RefreshToken.for_user(obj)
        return str(token)

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model= Product
        fields='__all__'