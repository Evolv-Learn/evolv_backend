# Email Configuration Guide

## 📧 Current Setup

Your email: **evolvngo@gmail.com**

## 🎯 Recommended Approach

### For Testing (Right Now)
Use **Console Backend** - emails print to terminal instead of sending

**Already configured in your `.env`:**
```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=evolvngo@gmail.com
```

**How it works:**
- When you register a user, the welcome email appears in your terminal
- No actual emails are sent
- Perfect for development and testing

### For Production (Later)
Use **Gmail SMTP** - sends real emails

## 🔧 How to Set Up Gmail SMTP (When Ready)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Evolv Django App"
4. Click "Generate"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update `.env`
```env
# Comment out console backend
# EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Uncomment and configure SMTP
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=evolvngo@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop  # Your 16-char app password (no spaces)
DEFAULT_FROM_EMAIL=evolvngo@gmail.com
```

### Step 4: Test
```python
# In Django shell
python manage.py shell

from django.core.mail import send_mail
send_mail(
    'Test Email',
    'This is a test email from Evolv.',
    'evolvngo@gmail.com',
    ['your-test-email@example.com'],
    fail_silently=False,
)
```

## 📝 Email Templates

Your emails will look like this:

### Welcome Email
```
Subject: Welcome to EvolvLearn!
From: evolvngo@gmail.com
To: student@example.com

Hi John,

Welcome to EvolvLearn! We're excited to have you join our learning community.

You can now:
- Browse our courses
- Apply to become a student
- Attend our events
- Connect with our community

If you have any questions, feel free to contact us at evolvngo@gmail.com

Best regards,
The EvolvLearn Team
```

### Application Received
```
Subject: Application Received - EvolvLearn
From: evolvngo@gmail.com
To: student@example.com

Hi John,

Thank you for applying to EvolvLearn!

We have received your application and our team will review it shortly.
You will receive an email notification once your application status is updated.

Application Details:
- Name: John Doe
- Email: student@example.com
- Courses: Data Science 101

Best regards,
The EvolvLearn Team
```

## 🎨 Professional Email Options

### Option 1: Use Gmail Directly (Current)
- **From**: evolvngo@gmail.com
- **Pros**: Easy to set up, free
- **Cons**: Looks less professional

### Option 2: Custom Domain (Future)
- **From**: noreply@evolvlearn.com
- **Pros**: More professional
- **Cons**: Requires domain and email service (SendGrid, Mailgun, AWS SES)

### Option 3: Gmail with Custom Name
- **From**: "EvolvLearn" <evolvngo@gmail.com>
- **Pros**: Professional name, easy setup
- **Cons**: Still shows Gmail address

To use Option 3, update settings:
```python
DEFAULT_FROM_EMAIL = 'EvolvLearn <evolvngo@gmail.com>'
```

## 🚀 Testing Emails

### Test 1: Console Backend (Current Setup)
```bash
# Start server
python manage.py runserver

# In another terminal, register a user
curl -X POST http://localhost:8000/api/v1/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Check the server terminal - you should see the email content
```

### Test 2: Real Email (After SMTP Setup)
Same as above, but the email will be sent to the actual email address.

## 📊 Email Sending Limits

### Gmail Free Account
- **Limit**: 500 emails per day
- **Rate**: ~20 emails per minute
- **Good for**: Small to medium platforms

### If You Need More
Consider these services:
- **SendGrid**: 100 emails/day free, then paid
- **Mailgun**: 5,000 emails/month free
- **AWS SES**: $0.10 per 1,000 emails
- **Postmark**: Transactional email specialist

## 🔒 Security Best Practices

1. ✅ **Never commit** `.env` file (already in .gitignore)
2. ✅ **Use app passwords**, not your real Gmail password
3. ✅ **Rotate passwords** regularly
4. ✅ **Monitor usage** in Gmail settings
5. ✅ **Use environment variables** for all secrets

## 🐛 Troubleshooting

### Error: "SMTPAuthenticationError"
**Solution**: Make sure you're using an App Password, not your regular password

### Error: "SMTPException: STARTTLS extension not supported"
**Solution**: Check `EMAIL_USE_TLS=True` in `.env`

### Error: "Connection refused"
**Solution**: Check `EMAIL_PORT=587` and `EMAIL_HOST=smtp.gmail.com`

### Emails not sending
**Solution**: 
1. Check `.env` configuration
2. Verify app password is correct (no spaces)
3. Check Gmail "Less secure app access" is OFF (use app passwords instead)
4. Check Django logs for errors

### Emails going to spam
**Solution**:
1. Add SPF record to your domain
2. Use a professional email service (SendGrid, etc.)
3. Avoid spam trigger words in subject/body
4. Include unsubscribe link (for marketing emails)

## 📋 Current Configuration Summary

**Your Setup:**
- Email: evolvngo@gmail.com
- Backend: Console (for testing)
- From Address: evolvngo@gmail.com
- Reply-To: evolvngo@gmail.com

**Status**: ✅ Ready for testing (emails print to console)

**Next Steps**:
1. Test with console backend first
2. When ready for production, set up Gmail SMTP
3. Consider custom domain for professional look

## 💡 Recommendation

**For Now**: Keep console backend for testing
**For Production**: Set up Gmail SMTP with app password
**For Scale**: Consider SendGrid or AWS SES

Your current setup is perfect for development! 🚀
