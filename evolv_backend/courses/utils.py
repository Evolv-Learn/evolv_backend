"""
Utility functions for the courses app
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_welcome_email(user):
    """Send welcome email to newly registered user"""
    from django.core.mail import EmailMessage
    from django.template.loader import render_to_string
    
    subject = "Welcome to EvolvLearn!"
    
    # Get frontend URL from settings
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    
    # HTML email content
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #1E3A8A 0%, #0F1F4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #FFF8F0; padding: 30px; }}
            .button {{ display: inline-block; background: #D4AF37; color: #1A1A1A; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
            .footer {{ background: #1A1A1A; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }}
            .kente-strip {{ height: 4px; background: linear-gradient(90deg, #DC143C 0%, #FFD700 25%, #228B22 50%, #D4AF37 75%, #1E3A8A 100%); }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="kente-strip"></div>
            <div class="header">
                <h1>Welcome to EvolvLearn! 🎉</h1>
            </div>
            <div class="content">
                <p>Hi {user.first_name or user.username},</p>
                
                <p>Welcome to EvolvLearn! We're excited to have you join our global learning community.</p>
                
                <p><strong>You can now:</strong></p>
                <ul>
                    <li>Browse our world-class courses</li>
                    <li>Attend events and workshops</li>
                    <li>Connect with our community</li>
                    <li>Access learning resources</li>
                </ul>
                
                <center>
                    <a href="{frontend_url}/dashboard" class="button">Go to Dashboard →</a>
                </center>
                
                <p>If you have any questions, feel free to contact us at <a href="mailto:evolvngo@gmail.com">evolvngo@gmail.com</a></p>
                
                <p>Best regards,<br>The EvolvLearn Team</p>
            </div>
            <div class="footer">
                <p>© 2024 EvolvLearn. All rights reserved.</p>
                <p>Marsaskala, Malta</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text fallback
    text_message = f"""
    Hi {user.first_name or user.username},
    
    Welcome to EvolvLearn! We're excited to have you join our learning community.
    
    You can now:
    - Browse our courses
    - Attend our events
    - Connect with our community
    
    Visit your dashboard: {frontend_url}/dashboard
    
    If you have any questions, contact us at evolvngo@gmail.com
    
    Best regards,
    The EvolvLearn Team
    """
    
    email = EmailMessage(
        subject=subject,
        body=text_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
        reply_to=['evolvngo@gmail.com'],
    )
    email.content_subtype = "html"
    email.body = html_message
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



def generate_verification_token():
    """Generate a unique verification token"""
    import secrets
    return secrets.token_urlsafe(32)


def send_verification_email(user):
    """Send email verification link to user"""
    from django.utils import timezone
    from django.core.mail import EmailMessage
    
    # Generate token
    token = generate_verification_token()
    user.email_verification_token = token
    user.email_verification_sent_at = timezone.now()
    user.save()
    
    # Get frontend URL
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    verification_link = f"{frontend_url}/verify-email?token={token}"
    
    subject = "Verify Your Email - EvolvLearn"
    
    # HTML email
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #1E3A8A 0%, #0F1F4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #FFF8F0; padding: 30px; }}
            .button {{ display: inline-block; background: #D4AF37; color: #1A1A1A; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; font-size: 16px; }}
            .footer {{ background: #1A1A1A; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }}
            .kente-strip {{ height: 4px; background: linear-gradient(90deg, #DC143C 0%, #FFD700 25%, #228B22 50%, #D4AF37 75%, #1E3A8A 100%); }}
            .warning {{ background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="kente-strip"></div>
            <div class="header">
                <h1>🔐 Verify Your Email</h1>
            </div>
            <div class="content">
                <p>Hi {user.first_name or user.username},</p>
                
                <p>Thank you for registering with EvolvLearn! To complete your registration and access your account, please verify your email address.</p>
                
                <center>
                    <a href="{verification_link}" class="button">Verify Email Address</a>
                </center>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="background: #f5f5f5; padding: 10px; word-break: break-all; font-size: 12px;">{verification_link}</p>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with EvolvLearn, please ignore this email.
                </div>
                
                <p>After verification, you'll be able to:</p>
                <ul>
                    <li>Apply for courses</li>
                    <li>Access your dashboard</li>
                    <li>Join our community</li>
                </ul>
                
                <p>If you have any questions, contact us at <a href="mailto:evolvngo@gmail.com">evolvngo@gmail.com</a></p>
                
                <p>Best regards,<br>The EvolvLearn Team</p>
            </div>
            <div class="footer">
                <p>© 2024 EvolvLearn. All rights reserved.</p>
                <p>Marsaskala, Malta</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text fallback
    text_message = f"""
    Hi {user.first_name or user.username},
    
    Thank you for registering with EvolvLearn!
    
    Please verify your email address by clicking this link:
    {verification_link}
    
    This link will expire in 24 hours.
    
    After verification, you'll be able to access your dashboard and apply for courses.
    
    If you didn't create an account, please ignore this email.
    
    Best regards,
    The EvolvLearn Team
    
    ---
    EvolvLearn
    Marsaskala, Malta
    evolvngo@gmail.com
    """
    
    email = EmailMessage(
        subject=subject,
        body=text_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
        reply_to=['evolvngo@gmail.com'],
    )
    email.content_subtype = "html"
    email.body = html_message
    email.send(fail_silently=True)
    
    return token
