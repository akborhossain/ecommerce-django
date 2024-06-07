from django.shortcuts import render
from .products import products
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.

class ProductView(APIView):
    def get(self, request, pk=None):
        if pk is not None:
            for i in products:
                if i['_id']== pk:
                    product=i
            return Response(product)
        return Response(products)
