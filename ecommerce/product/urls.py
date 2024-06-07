from django.urls import path
from django import views
from .views import *

urlpatterns=[
    path('products/', ProductView.as_view()),
    path('products/<str:pk>/', ProductView.as_view()),

]