"""
Custom throttling classes for rate limiting
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class RegisterRateThrottle(AnonRateThrottle):
    """Limit registration attempts"""
    rate = '5/hour'


class LoginRateThrottle(AnonRateThrottle):
    """Limit login attempts"""
    rate = '10/hour'


class ContactUsRateThrottle(AnonRateThrottle):
    """Limit contact form submissions"""
    rate = '3/hour'


class StudentApplicationRateThrottle(UserRateThrottle):
    """Limit student application submissions"""
    rate = '2/day'
