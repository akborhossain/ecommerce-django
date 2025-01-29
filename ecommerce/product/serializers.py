from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *


class UserSerializer(serializers.ModelSerializer):
    name= serializers.SerializerMethodField(read_only=True)
    _id=serializers.SerializerMethodField(read_only=True)
    class Meta:
        model= User
        fields=['id','_id', 'first_name', 'last_name', 'username', 'email', 'name', 'is_staff']

    def get_name(self,obj):
        name = obj.first_name +" "+ obj.last_name
        if name==" ":
            name= obj.username
        return name
    def get__id(self, obj):
        _id=obj.id
        return _id
    
class UserSerializerWithToken(UserSerializer):
    token=serializers.SerializerMethodField(read_only=True)
    class Meta:
        model=User
        fields=['id','_id', 'username', 'email', 'name', 'is_staff', 'token']
    def get_token(self,obj):
        token=RefreshToken.for_user(obj)
        return str(token.access_token)

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model= Product
        fields='__all__'