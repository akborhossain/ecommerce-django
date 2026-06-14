from django.urls import path
from .views import *


urlpatterns=[
    path('', OrderView.as_view()),
    path('addresses/', UserAddressView.as_view()),
    path('addresses/<str:pk>/', UserAddressView.as_view()),
    path('<str:pk>/pay/', OrderPayView.as_view()),
    path('<str:pk>/deliver/', OrderDeliverView.as_view()),
    path('<str:pk>/returns/', ReturnRequestView.as_view()),
    path('<str:pk>/', OrderView.as_view()),
]