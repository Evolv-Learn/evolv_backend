from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework import status

from courses.throttles import LoginRateThrottle

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        throttle_classes = [LoginRateThrottle]
        response = super().post(request, *args, **kwargs)
        return Response({"message": "Login successful!", "tokens": response.data}, status=status.HTTP_200_OK)
