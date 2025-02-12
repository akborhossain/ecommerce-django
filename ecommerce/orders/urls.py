from django.urls import path
from .views import *


urlpatterns=[
    path('', Order.as_view()),
]