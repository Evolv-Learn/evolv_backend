from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework import status

from courses.throttles import LoginRateThrottle

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        throttle_classes = [LoginRateThrottle]
        
        # Get username/email from request
        username = request.data.get('username')
        
        if not username:
            return Response(
                {"detail": "Username or email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find user by username or email
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=username)
            except User.DoesNotExist:
                # Let the parent class handle invalid credentials
                return super().post(request, *args, **kwargs)
        
        # Check if email is verified (skip for superusers and staff)
        if not user.is_email_verified and not user.is_superuser and not user.is_staff:
            return Response(
                {
                    "detail": "Please verify your email before logging in. Check your inbox for the verification link.",
                    "email_not_verified": True,
                    "email": user.email
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Proceed with normal login
        response = super().post(request, *args, **kwargs)
        return Response({"message": "Login successful!", "tokens": response.data}, status=status.HTTP_200_OK)
