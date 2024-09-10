from django.urls import path
from django import views
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

urlpatterns=[
    path('users/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('products/', ProductView.as_view()),
    path('products/<str:pk>/', ProductView.as_view()),

]