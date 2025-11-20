# ⚡ Azure Deployment - Quick Start

## 🚀 Deploy in 10 Minutes

### Step 1: Create Resources (2 min)
```bash
az login
az group create --name evolvlearn-rg --location eastus
az appservice plan create --name evolvlearn-plan --resource-group evolvlearn-rg --sku B1 --is-linux
```

### Step 2: Create Backend App (1 min)
```bash
az webapp create \
  --resource-group evolvlearn-rg \
  --plan evolvlearn-plan \
  --name evolvlearn-backend \
  --runtime "PYTHON:3.11"
```

### Step 3: Create Frontend App (1 min)
```bash
az webapp create \
  --resource-group evolvlearn-rg \
  --plan evolvlearn-plan \
  --name evolvlearn-frontend \
  --runtime "NODE:18-lts"
```

### Step 4: Create Database (2 min)
```bash
az postgres flexible-server create \
  --resource-group evolvlearn-rg \
  --name evolvlearn-db \
  --admin-user evolvadmin \
  --admin-password 'SecurePass123!' \
  --sku-name Standard_B1ms
```

### Step 5: Configure Backend (2 min)
```bash
az webapp config appsettings set \
  --resource-group evolvlearn-rg \
  --name evolvlearn-backend \
  --settings \
    DEBUG=False \
    SECRET_KEY='change-this-secret-key' \
    DATABASE_URL='postgresql://evolvadmin:SecurePass123!@evolvlearn-db.postgres.database.azure.com/postgres'
```

### Step 6: Deploy Code (2 min)
```bash
# Using Azure Pipelines (Recommended)
# 1. Push code to GitHub
# 2. Create pipeline in Azure DevOps
# 3. Use azure-pipelines.yml
# 4. Run pipeline

# OR using Git
git remote add azure <deployment-url>
git push azure main
```

---

## 📋 Files Created

✅ `azure-pipelines.yml` - CI/CD pipeline
✅ `evolv_backend/startup.sh` - Backend startup script
✅ `.deployment` - Deployment config
✅ `requirements.txt` - Updated with gunicorn
✅ `AZURE_DEPLOYMENT.md` - Full guide
✅ `AZURE_QUICK_START.md` - This file

---

## 🔗 Your URLs

After deployment:
- **Backend**: https://evolvlearn-backend.azurewebsites.net
- **Frontend**: https://evolvlearn-frontend.azurewebsites.net
- **Admin**: https://evolvlearn-backend.azurewebsites.net/admin

---

## ⚙️ Environment Variables

### Backend (.env or Azure App Settings)
```
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@host/db
ALLOWED_HOSTS=evolvlearn-backend.azurewebsites.net
CORS_ALLOWED_ORIGINS=https://evolvlearn-frontend.azurewebsites.net
```

### Frontend (.env.local or Azure App Settings)
```
NEXT_PUBLIC_API_URL=https://evolvlearn-backend.azurewebsites.net/api
```

---

## 🎯 Next Steps

1. ✅ Run migrations: `az webapp ssh` → `python manage.py migrate`
2. ✅ Create superuser: `python manage.py createsuperuser`
3. ✅ Test backend: Visit `/admin`
4. ✅ Test frontend: Visit homepage
5. ✅ Configure custom domain (optional)
6. ✅ Enable monitoring

---

## 💰 Estimated Costs

- **Free Tier**: $0/month (12 months free)
- **Basic Tier**: ~$25/month
- **Standard Tier**: ~$170/month

---

## 🆘 Quick Troubleshooting

```bash
# View logs
az webapp log tail --name evolvlearn-backend --resource-group evolvlearn-rg

# Restart app
az webapp restart --name evolvlearn-backend --resource-group evolvlearn-rg

# SSH into app
az webapp ssh --name evolvlearn-backend --resource-group evolvlearn-rg

# Check settings
az webapp config appsettings list --name evolvlearn-backend --resource-group evolvlearn-rg
```

---

## 📚 Full Documentation

See `AZURE_DEPLOYMENT.md` for complete step-by-step guide.

---

**Ready to deploy! 🚀**
