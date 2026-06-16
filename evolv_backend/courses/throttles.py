"""
Custom throttling classes for rate limiting
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class RegisterRateThrottle(AnonRateThrottle):
    """Limit registration attempts"""
    rate = '100/hour'  # raised for local testing — set back to 5/hour before production


class LoginRateThrottle(AnonRateThrottle):
    """Limit login attempts"""
    rate = '100/hour'  # raised for local testing — set back to 10/hour before production


class ContactUsRateThrottle(AnonRateThrottle):
    """Limit contact form submissions"""
    rate = '3/hour'


class StudentApplicationRateThrottle(UserRateThrottle):
    """Limit student application submissions"""
    rate = '2/day'
