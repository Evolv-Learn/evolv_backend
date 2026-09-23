"""
Custom throttling classes for rate limiting
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class RegisterRateThrottle(AnonRateThrottle):
    """Limit registration attempts to 5 per hour per IP"""
    rate = '5/hour'


class LoginRateThrottle(AnonRateThrottle):
    """Limit login attempts to 10 per hour per IP"""
    rate = '10/hour'


class ContactUsRateThrottle(AnonRateThrottle):
    """Limit contact form submissions to 5 per hour per IP"""
    rate = '5/hour'


class EventRegistrationRateThrottle(AnonRateThrottle):
    """Limit event registration submissions to 10 per hour per IP"""
    rate = '10/hour'


class CTATrackRateThrottle(AnonRateThrottle):
    """
    Generous limit for CTA click tracking.
    A real visitor can easily click 60+ buttons in an hour browsing the site.
    """
    rate = '200/hour'


class StudentApplicationRateThrottle(UserRateThrottle):
    """Limit student application submissions to 2 per day per user"""
    rate = '2/day'
