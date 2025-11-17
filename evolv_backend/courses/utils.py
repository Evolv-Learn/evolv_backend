"""
Utility functions for the courses app
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_welcome_email(user):
    """Send welcome email to newly registered user"""
    from django.core.mail import EmailMessage
    
    subject = "Welcome to EvolvLearn!"
    message = f"""
    Hi {user.first_name or user.username},
    
    Welcome to EvolvLearn! We're excited to have you join our learning community.
    
    You can now:
    - Browse our courses
    - Apply to become a student
    - Attend our events
    - Connect with our community
    
    If you have any questions, feel free to contact us at evolvngo@gmail.com
    
    Best regards,
    The EvolvLearn Team
    """
    
    email = EmailMessage(
        subject=subject,
        body=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
        reply_to=['evolvngo@gmail.com'],
    )
    email.send(fail_silently=True)


def send_application_received_email(student):
    """Send confirmation email when student application is received"""
    subject = "Application Received - EvolvLearn"
    message = f"""
    Hi {student.first_name},
    
    Thank you for applying to EvolvLearn!
    
    We have received your application and our team will review it shortly.
    You will receive an email notification once your application status is updated.
    
    Application Details:
    - Name: {student.first_name} {student.last_name}
    - Email: {student.email}
    - Courses: {', '.join([c.name for c in student.courses.all()])}
    
    Best regards,
    The EvolvLearn Team
    """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [student.email],
        fail_silently=True,
    )


def send_application_status_email(student, status, message_text=""):
    """Send email when application status changes"""
    if status == "approved":
        subject = "Congratulations! Your Application is Approved"
        message = f"""
        Hi {student.first_name},
        
        Great news! Your application to EvolvLearn has been approved!
        
        You can now access:
        - Our GitHub repository
        - Discord community
        - Learning materials
        
        Login to your dashboard to get started: {settings.FRONTEND_URL}/dashboard
        
        {message_text}
        
        Best regards,
        The EvolvLearn Team
        """
    else:
        subject = "Application Status Update - EvolvLearn"
        message = f"""
        Hi {student.first_name},
        
        Thank you for your interest in EvolvLearn.
        
        {message_text}
        
        If you have any questions, please don't hesitate to contact us.
        
        Best regards,
        The EvolvLearn Team
        """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [student.email],
        fail_silently=True,
    )


def generate_student_register_number(student):
    """Generate unique registration number for student"""
    # Format: EVOLV-YYYY-XXXX (e.g., EVOLV-2024-0001)
    from datetime import datetime
    year = datetime.now().year
    
    # Get count of students registered this year
    from .models import Student
    count = Student.objects.filter(
        register_number__startswith=f"EVOLV-{year}"
    ).count() + 1
    
    return f"EVOLV-{year}-{count:04d}"
