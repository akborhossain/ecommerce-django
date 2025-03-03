from django.urls import path
from .views import *


urlpatterns=[
    path('', OrderView.as_view()),
    path('<str:pk>/',OrderView.as_view()),
]