from django.urls import path
from django import views
from .views import *

urlpatterns=[
<<<<<<< HEAD
    path('users/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
=======
    path('users/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/profile/', UserProfileView.as_view()),
>>>>>>> d83d40805d2cc0daeb97ebe0a2bcc8245a688ba4
    path('products/', ProductView.as_view()),
    path('products/<str:pk>/', ProductView.as_view()),

]