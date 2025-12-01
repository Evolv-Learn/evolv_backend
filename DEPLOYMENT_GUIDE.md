# Deployment Guide - Evolv Learning Platform

Complete guide to deploy your Django backend to Render and Next.js frontend to Vercel.

---

## 📋 Pre-Deployment Checklist

### 1. **Prepare Your Code**
- [ ] All migrations are up to date
- [ ] .gitignore is properly configured
- [ ] Environment variables are documented
- [ ] Database is working locally
- [ ] Frontend connects to backend API

### 2. **Required Accounts**
- [ ] GitHub account (for code repository)
- [ ] Render account (for backend) - https://render.com
- [ ] Vercel account (for frontend) - https://vercel.com
- [ ] PostgreSQL database (Render provides free tier)

---

## 🔧 Part 1: Backend Deployment (Render)

### Step 1: Prepare Django for Production

#### 1.1 Create `requirements.txt` (if not exists)
```bash
cd evolv_backend
pip freeze > requirements.txt
```

#### 1.2 Create `build.sh` script
Create `evolv_backend/build.sh`:

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
```

Make it executable:
```bash
chmod +x build.sh
```

#### 1.3 Update `settings.py` for Production

Add to `evolv_backend/evolv_backend/settings.py`:

```python
import os
import dj_database_url

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')

# Database
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
```

#### 1.4 Install Production Dependencies

Add to `requirements.txt`:
```
gunicorn>=21.0.0
dj-database-url>=2.0.0
psycopg2-binary>=2.9.0
whitenoise>=6.5.0
```

Install:
```bash
pip install -r requirements.txt
```

#### 1.5 Configure WhiteNoise for Static Files

In `settings.py`, update MIDDLEWARE:
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    # ... rest of middleware
]

# Add at the end
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### Step 2: Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Prepare for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/evolv-backend.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render

#### 3.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

#### 3.2 Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `evolv-db`
3. Database: `evolv_db`
4. User: `evolv_user`
5. Region: Choose closest to your users
6. Plan: Free (or paid for production)
7. Click "Create Database"
8. **Copy the Internal Database URL** (starts with `postgresql://`)

#### 3.3 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `evolv-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `evolv_backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn evolv_backend.wsgi:application`
   - **Plan**: Free (or paid)

#### 3.4 Add Environment Variables
In Render dashboard, go to "Environment" tab and add:

```
DEBUG=False
SECRET_KEY=your-super-secret-key-here-generate-new-one
DATABASE_URL=postgresql://... (from step 3.2)
ALLOWED_HOSTS=evolv-backend.onrender.com,localhost
FRONTEND_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
DJANGO_ALLOWED_HOSTS=evolv-backend.onrender.com

# Email settings (optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=EvolvLearn <your-email@gmail.com>
```

**Generate SECRET_KEY:**
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### 3.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your backend will be at: `https://evolv-backend.onrender.com`

#### 3.6 Verify Deployment
Visit:
- `https://evolv-backend.onrender.com/api/v1/` - Should show API root
- `https://evolv-backend.onrender.com/admin/` - Django admin
- `https://evolv-backend.onrender.com/api/docs/` - Swagger docs

---

## 🎨 Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Next.js for Production

#### 1.1 Update Environment Variables

Create `evolv_frontend/.env.production`:
```
NEXT_PUBLIC_API_URL=https://evolv-backend.onrender.com/api/v1
```

#### 1.2 Update `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'evolv-backend.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'evolv-backend.onrender.com',
        pathname: '/media/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
```

#### 1.3 Test Build Locally
```bash
cd evolv_frontend
npm run build
npm start
```

### Step 2: Push Frontend to GitHub

```bash
cd evolv_frontend
git init
git add .
git commit -m "Prepare frontend for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/evolv-frontend.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

#### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

#### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Import your `evolv-frontend` repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or `evolv_frontend` if monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 3.3 Add Environment Variables
In Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://evolv-backend.onrender.com/api/v1
```

#### 3.4 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your frontend will be at: `https://your-project.vercel.app`

#### 3.5 Update Backend CORS

Go back to Render → Environment Variables and update:
```
FRONTEND_ORIGINS=https://your-project.vercel.app,http://localhost:3000
```

Redeploy backend for changes to take effect.

---

## 🔄 Part 3: Connect Frontend to Backend

### Update Backend ALLOWED_HOSTS and CORS

In Render environment variables:
```
ALLOWED_HOSTS=evolv-backend.onrender.com,localhost
FRONTEND_ORIGINS=https://your-project.vercel.app,http://localhost:3000
```

### Test the Connection

1. Visit your Vercel frontend
2. Try to login
3. Browse courses
4. Check if API calls work

---

## 📊 Part 4: Database Setup

### Run Migrations on Render

1. Go to Render dashboard → Your web service
2. Click "Shell" tab
3. Run:
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Create Default Categories

In Render shell:
```python
python manage.py shell

from courses.models import CourseCategory

CourseCategory.objects.create(
    name='Data & AI',
    description='Data Science and Artificial Intelligence courses',
    icon='📊',
    color='bg-primary-gold',
    order=1
)

CourseCategory.objects.create(
    name='Cybersecurity',
    description='Cybersecurity and Information Security courses',
    icon='🔒',
    color='bg-igbo-red',
    order=2
)

CourseCategory.objects.create(
    name='Microsoft Dynamics 365',
    description='Business applications and ERP systems',
    icon='💼',
    color='bg-hausa-indigo',
    order=3
)
```

---

## 🎯 Part 5: Custom Domain (Optional)

### For Backend (Render)
1. Go to Render dashboard → Settings
2. Add custom domain: `api.yourdomain.com`
3. Add DNS records at your domain provider:
   - Type: CNAME
   - Name: api
   - Value: evolv-backend.onrender.com

### For Frontend (Vercel)
1. Go to Vercel project → Settings → Domains
2. Add domain: `yourdomain.com`
3. Add DNS records:
   - Type: A
   - Name: @
   - Value: (Vercel provides IP)

---

## 🔒 Part 6: Security Checklist

- [ ] DEBUG=False in production
- [ ] Strong SECRET_KEY generated
- [ ] ALLOWED_HOSTS configured
- [ ] CORS properly configured
- [ ] SSL/HTTPS enabled (automatic on Render/Vercel)
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] Email credentials secured
- [ ] Admin password is strong

---

## 📝 Part 7: Post-Deployment

### Monitor Your Apps

**Render:**
- Check logs: Dashboard → Logs
- Monitor metrics: Dashboard → Metrics
- Set up alerts

**Vercel:**
- Check deployments: Dashboard → Deployments
- Monitor analytics: Dashboard → Analytics
- Check function logs

### Backup Database

Set up automatic backups in Render:
1. Go to PostgreSQL database
2. Enable automatic backups
3. Or manually backup:
```bash
pg_dump DATABASE_URL > backup.sql
```

---

## 🐛 Troubleshooting

### Backend Issues

**500 Error:**
- Check Render logs
- Verify DATABASE_URL is correct
- Check migrations ran successfully

**Static files not loading:**
- Run `python manage.py collectstatic`
- Check WhiteNoise is configured

**CORS errors:**
- Verify FRONTEND_ORIGINS includes your Vercel URL
- Check CORS middleware is installed

### Frontend Issues

**API calls failing:**
- Check NEXT_PUBLIC_API_URL is correct
- Verify backend CORS allows your domain
- Check network tab in browser

**Build failing:**
- Check all dependencies are in package.json
- Verify no TypeScript errors
- Check build logs in Vercel

---

## 💰 Cost Estimate

### Free Tier (Good for testing)
- **Render**: Free PostgreSQL + Free Web Service
- **Vercel**: Free hosting
- **Total**: $0/month

### Production Tier
- **Render**: 
  - PostgreSQL: $7/month
  - Web Service: $7/month
- **Vercel**: 
  - Pro: $20/month (optional)
- **Total**: $14-34/month

---

## 🚀 Quick Deploy Commands

### Backend (Render)
```bash
cd evolv_backend
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
gunicorn evolv_backend.wsgi:application
```

### Frontend (Vercel)
```bash
cd evolv_frontend
npm install
npm run build
npm start
```

---

## 📞 Support

If you encounter issues:
1. Check Render/Vercel logs
2. Review this guide
3. Check Django/Next.js documentation
4. Contact support

---

**Congratulations! Your app is now live! 🎉**

Backend: https://evolv-backend.onrender.com
Frontend: https://your-project.vercel.app
