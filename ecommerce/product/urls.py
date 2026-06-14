from django.urls import path
from django import views
from .views import *

urlpatterns=[
    path('users/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/register/', RegisterUser.as_view(), name='register'),
    path('users/profile/', UserProfileView.as_view()),
    path('users/',UserView.as_view()),
    path('products/', ProductView.as_view()),
    path('products/categories/', CategoryListView.as_view(), name='product-categories'),
    path('products/top/', TopProductsView.as_view(), name='top-products'),
    path('products/<str:pk>/reviews/', CreateProductReview.as_view(), name='create-review'),
    path('products/<str:pk>/', ProductView.as_view()),

]