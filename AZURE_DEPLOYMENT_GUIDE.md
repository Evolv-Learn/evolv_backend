# Azure App Service Deployment Guide

## Prerequisites
- Azure subscription (you have this ✅)
- Azure CLI installed (optional but recommended)
- Your code pushed to GitHub

## Step-by-Step Deployment

### Step 1: Create Resource Group

1. **Login to Azure Portal:** https://portal.azure.com
2. **Search for "Resource groups"** in the top search bar
3. **Click "+ Create"**
4. **Fill in:**
   - **Subscription:** Your subscription
   - **Resource group name:** `evolv-backend-rg`
   - **Region:** Choose closest to your users (e.g., `East US`, `West Europe`)
5. **Click "Review + Create"** → **"Create"**

### Step 2: Create PostgreSQL Database

1. **Search for "Azure Database for PostgreSQL"**
2. **Click "+ Create"** → **"Flexible server"**
3. **Fill in:**
   - **Resource group:** `evolv-backend-rg`
   - **Server name:** `evolv-db-server` (must be globally unique)
   - **Region:** Same as resource group
   - **PostgreSQL version:** 16
   - **Workload type:** Development
   - **Compute + storage:** Burstable, B1ms (cheapest)
   - **Admin username:** `evolv_admin`
   - **Password:** Create a strong password (save it!)
4. **Networking tab:**
   - **Connectivity method:** Public access
   - ✅ Check "Allow public access from any Azure service"
5. **Click "Review + Create"** → **"Create"** (takes 5-10 minutes)

### Step 3: Configure Database

1. **Go to your PostgreSQL server** → **Databases**
2. **Click "+ Add"**
3. **Database name:** `evolv_db`
4. **Click "Save"**

5. **Go to "Networking"** (left sidebar)
6. **Add your IP address** to firewall rules (for local access)
7. **Click "Save"**

### Step 4: Create App Service (Web App)

1. **Search for "App Services"**
2. **Click "+ Create"** → **"Web App"**
3. **Basics tab:**
   - **Resource group:** `evolv-backend-rg`
   - **Name:** `evolv-backend` (must be globally unique, will be: evolv-backend.azurewebsites.net)
   - **Publish:** Code
   - **Runtime stack:** Python 3.11
   - **Operating System:** Linux
   - **Region:** Same as resource group
   - **Pricing plan:** Basic B1 (or Free F1 for testing)
4. **Click "Review + Create"** → **"Create"**

### Step 5: Configure App Service

1. **Go to your App Service** → **Configuration** (left sidebar)
2. **Click "+ New application setting"** for each:

```
ALLOWED_HOSTS=evolv-backend.azurewebsites.net,evolv-backend-s9a8.vercel.app
SECRET_KEY=your-secret-key-here-generate-new-one
DEBUG=False
DATABASE_URL=postgresql://evolv_admin:YOUR_PASSWORD@evolv-db-server.postgres.database.azure.com:5432/evolv_db?sslmode=require
FRONTEND_ORIGINS=https://evolv-backend-s9a8.vercel.app
FRONTEND_URL=https://evolv-backend-s9a8.vercel.app
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=evolvngo@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=EvolvLearn <evolvngo@gmail.com>
WEBSITE_HTTPLOGGING_RETENTION_DAYS=7
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

3. **Click "Save"** at the top

### Step 6: Deploy from GitHub

1. **Go to "Deployment Center"** (left sidebar)
2. **Source:** GitHub
3. **Authorize** GitHub access
4. **Organization:** Your GitHub username
5. **Repository:** `evolv_backend`
6. **Branch:** `main`
7. **Build provider:** App Service build service
8. **Click "Save"**

Azure will automatically:
- Pull your code from GitHub
- Install dependencies from requirements.txt
- Run migrations
- Start gunicorn server

### Step 7: Run Initial Setup

1. **Go to "SSH"** or **"Console"** (under Development Tools)
2. **Run these commands:**

```bash
cd site/wwwroot/evolv_backend
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

### Step 8: Update Vercel Frontend

1. **Go to Vercel Dashboard** → Your project
2. **Settings** → **Environment Variables**
3. **Update `NEXT_PUBLIC_API_URL`:**
   ```
   https://evolv-backend.azurewebsites.net/api/v1
   ```
4. **Redeploy** your frontend

### Step 9: Test Your Deployment

1. **Visit:** `https://evolv-backend.azurewebsites.net/admin/`
2. **Login** with superuser credentials
3. **Add courses and categories**
4. **Visit your Vercel frontend** and test registration/login

## Troubleshooting

### View Logs
- Go to App Service → **Log stream** (left sidebar)
- Or **Diagnose and solve problems**

### Common Issues

**Database connection fails:**
- Check DATABASE_URL format
- Verify firewall rules allow Azure services
- Check password is correct

**Static files not loading:**
```bash
python manage.py collectstatic --noinput
```

**Migrations not running:**
```bash
python manage.py migrate --run-syncdb
```

## Cost Estimate

- **App Service B1:** ~$13/month
- **PostgreSQL Flexible B1ms:** ~$12/month
- **Total:** ~$25/month

Or use Free tier for testing (F1 App Service + Burstable PostgreSQL)

## Auto-Deploy

Once set up, every time you push to GitHub main branch:
- ✅ Azure automatically pulls changes
- ✅ Installs dependencies
- ✅ Restarts server
- ✅ Your app is updated!

## Next Steps

1. Set up custom domain (optional)
2. Enable HTTPS (automatic with Azure)
3. Set up monitoring and alerts
4. Configure backup for database
5. Set up staging environment

---

**Your URLs:**
- Backend: `https://evolv-backend.azurewebsites.net`
- Admin: `https://evolv-backend.azurewebsites.net/admin/`
- API: `https://evolv-backend.azurewebsites.net/api/v1/`
- Frontend: `https://evolv-backend-s9a8.vercel.app`
