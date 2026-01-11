"""
URL Configuration for Spam Detector API
"""

from django.urls import path
from . import views

urlpatterns = [
    path('predict', views.predict, name='predict'),
    path('health', views.health_check, name='health'),
]
