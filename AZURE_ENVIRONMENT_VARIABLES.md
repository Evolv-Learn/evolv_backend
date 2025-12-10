# Azure Environment Variables Setup 🔐

## IMPORTANT: Local .env vs Azure Environment Variables

Your local `.env` file (with `DEBUG=True`) is **NOT** deployed to Azure.
Azure uses **Application Settings** configured in the Azure Portal.

---

## Required Azure Environment Variables

Go to: **Azure Portal → Your App Service → Configuration → Application Settings**

### 1. Django Core Settings

```
SECRET_KEY = <generate-new-secret-key-for-production>
DEBUG = False
ALLOWED_HOSTS = your-backend.azurewebsites.net,localhost
DJANGO_ALLOWED_HOSTS = your-backend.azurewebsites.net
```

**Generate a new SECRET_KEY:**
```python
# Run this in Python to generate a new key
import secrets
print(secrets.token_urlsafe(50))
```

### 2. Database Configuration

```
DATABASE_URL = postgresql://username:password@host:5432/database_name
```

Or individual settings:
```
DB_NAME = evolv_db
DB_USER = evolv_user
DB_PASSWORD = <your-production-db-password>
DB_HOST = <your-azure-postgres-host>.postgres.database.azure.com
DB_PORT = 5432
```

### 3. Frontend Configuration

```
FRONTEND_URL = https://your-frontend-url.vercel.app
FRONTEND_ORIGINS = https://your-frontend-url.vercel.app
```

### 4. Email Configuration (Production)

```
EMAIL_BACKEND = django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = evolvngo@gmail.com
EMAIL_HOST_PASSWORD = egcp dxka djew wsvu
DEFAULT_FROM_EMAIL = EvolvLearn <evolvngo@gmail.com>
```

### 5. Static/Media Files (Optional - Azure Storage)

If using Azure Blob Storage for media files:
```
AZURE_ACCOUNT_NAME = <your-storage-account>
AZURE_ACCOUNT_KEY = <your-storage-key>
AZURE_CONTAINER = media
```

---

## How to Set Environment Variables in Azure

### Method 1: Azure Portal (Recommended)

1. Go to **Azure Portal** (portal.azure.com)
2. Navigate to your **App Service**
3. Click **Configuration** (left sidebar)
4. Click **Application settings** tab
5. Click **+ New application setting**
6. Add each variable:
   - Name: `DEBUG`
   - Value: `False`
   - Click **OK**
7. Repeat for all variables above
8. Click **Save** at the top
9. Click **Continue** to restart the app

### Method 2: Azure CLI

```bash
# Set DEBUG to False
az webapp config appsettings set --name your-app-name --resource-group your-resource-group --settings DEBUG=False

# Set SECRET_KEY
az webapp config appsettings set --name your-app-name --resource-group your-resource-group --settings SECRET_KEY="your-new-secret-key"

# Set ALLOWED_HOSTS
az webapp config appsettings set --name your-app-name --resource-group your-resource-group --settings ALLOWED_HOSTS="your-backend.azurewebsites.net"
```

---

## Verify Environment Variables

### Check in Azure Portal:
1. Go to **App Service → Configuration → Application settings**
2. Verify all variables are listed
3. Check that `DEBUG = False`

### Check in SSH Console:
1. Go to **App Service → SSH** (or Development Tools → SSH)
2. Run:
```bash
echo $DEBUG
echo $SECRET_KEY
echo $ALLOWED_HOSTS
```

---

## Critical Production Settings Checklist

- [ ] `DEBUG = False` (MUST be False in production!)
- [ ] `SECRET_KEY` = New unique key (not the one from local .env)
- [ ] `ALLOWED_HOSTS` includes your Azure domain
- [ ] `DATABASE_URL` points to production database
- [ ] `FRONTEND_URL` points to production frontend
- [ ] `EMAIL_BACKEND` = SMTP (not console)
- [ ] Email credentials are correct

---

## Security Best Practices

### ✅ DO:
- Use different SECRET_KEY for production
- Set DEBUG=False in production
- Use environment variables (never commit secrets)
- Use strong database passwords
- Enable HTTPS only
- Restrict ALLOWED_HOSTS to your domain

### ❌ DON'T:
- Don't use DEBUG=True in production
- Don't commit .env file to git
- Don't use the same SECRET_KEY as local
- Don't expose sensitive data in logs
- Don't allow all hosts (*)

---

## Current Status Check

### Your Local .env (Development):
```
DEBUG=True ✅ (OK for local development)
SECRET_KEY=django-insecure-... ✅ (OK for local)
ALLOWED_HOSTS=localhost,127.0.0.1 ✅ (OK for local)
```

### Your Azure Settings (Production) - MUST HAVE:
```
DEBUG=False ⚠️ (Check Azure Portal)
SECRET_KEY=<new-production-key> ⚠️ (Check Azure Portal)
ALLOWED_HOSTS=your-backend.azurewebsites.net ⚠️ (Check Azure Portal)
DATABASE_URL=<production-db> ⚠️ (Check Azure Portal)
```

---

## Quick Verification Script

After setting environment variables, verify with this:

```bash
# SSH into Azure App Service
cd /home/site/wwwroot

# Check Django settings
python manage.py shell

# In Python shell:
from django.conf import settings
print(f"DEBUG: {settings.DEBUG}")  # Should be False
print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
print(f"DATABASE: {settings.DATABASES['default']['HOST']}")
```

---

## What Happens on Deployment

1. **Git push** triggers deployment
2. Azure **installs** dependencies from requirements.txt
3. Azure **reads** environment variables from Application Settings
4. Azure **runs** migrations (if configured)
5. Azure **collects** static files
6. Azure **restarts** the app with production settings

**Your local .env file is NEVER uplo