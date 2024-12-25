from django.urls import path
from django import views
from .views import *

urlpatterns=[
    path('users/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('products/', ProductView.as_view()),
    path('products/<str:pk>/', ProductView.as_view()),

]