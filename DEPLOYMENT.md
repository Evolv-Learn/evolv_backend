# 🚀 EvolvLearn Deployment Guide

## 📋 Project Structure

```
evolv_backend/
├── requirements.txt          # Python dependencies (at root)
├── evolv_backend/           # Django backend
│   ├── manage.py
│   ├── courses/
│   └── ...
├── evolv_frontend/          # Next.js frontend
│   ├── package.json
│   ├── src/
│   └── ...
└── guide/                   # Documentation
```

---

## 🔧 Local Development Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- PostgreSQL (optional, SQLite works for development)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd evolv_backend
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
# From project root
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment
```bash
cd evolv_backend
cp .env.example .env  # If exists, or create new .env
```

Edit `.env` file:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Create Superuser
```bash
python manage.py createsuperuser
```

#### Start Backend Server
```bash
python manage.py runserver
```
Backend runs at: http://localhost:8000

### 3. Frontend Setup

#### Open New Terminal
```bash
cd evolv_frontend
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment
```bash
# Create .env.local file
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api > .env.local
```

#### Start Frontend Server
```bash
npm run dev
```
Frontend runs at: http://localhost:3000

---

## 🌐 Production Deployment

### Backend (Django)

#### 1. Update Settings
```python
# evolv_backend/evolv_backend/settings.py
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
```

#### 2. Collect Static Files
```bash
python manage.py collectstatic
```

#### 3. Use Production Database
Update `.env`:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

#### 4. Deploy Options

**Option A: Heroku**
```bash
# Install Heroku CLI
heroku create evolvlearn-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

**Option B: DigitalOcean/AWS/Azure**
- Use Gunicorn as WSGI server
- Configure Nginx as reverse proxy
- Set up SSL certificate
- Use PostgreSQL database

**Option C: Railway/Render**
- Connect GitHub repository
- Set environment variables
- Deploy automatically

### Frontend (Next.js)

#### 1. Update Environment
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

#### 2. Build for Production
```bash
npm run build
```

#### 3. Deploy Options

**Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

**Option B: Netlify**
```bash
npm run build
# Upload .next folder to Netlify
```

**Option C: Self-hosted**
```bash
npm run build
npm start
```

---

## 🐳 Docker Deployment

### Create Dockerfile (Backend)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY evolv_backend/ .

CMD ["gunicorn", "evolv_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Create Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY evolv_frontend/package*.json ./
RUN npm install

COPY evolv_frontend/ .
RUN npm run build

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/evolvlearn
    depends_on:
      - db

  frontend:
    build: ./evolv_frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=evolvlearn
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
DEBUG=False
SECRET_KEY=your-super-secret-key-change-this
DATABASE_URL=postgresql://user:pass@host:5432/db
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# AWS S3 (optional, for media files)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 📊 Database Migration

### PostgreSQL Setup
```bash
# Install PostgreSQL
# Create database
createdb evolvlearn

# Update .env
DATABASE_URL=postgresql://username:password@localhost:5432/evolvlearn

# Run migrations
python manage.py migrate
```

### Backup Database
```bash
# Backup
python manage.py dumpdata > backup.json

# Restore
python manage.py loaddata backup.json
```

---

## 🔍 Troubleshooting

### Backend Issues
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Clear migrations
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
python manage.py makemigrations
python manage.py migrate
```

### Frontend Issues
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run dev
```

### Database Issues
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

---

## 📝 Post-Deployment Checklist

- [ ] Update SECRET_KEY in production
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Configure email service
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure CDN for static files
- [ ] Set up CI/CD pipeline
- [ ] Test all features in production
- [ ] Set up domain and DNS

---

## 🆘 Support

For issues or questions:
1. Check documentation in `/guide` folder
2. Review error logs
3. Check Django/Next.js documentation
4. Contact development team

---

## 📚 Additional Resources

- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

**Good luck with your deployment! 🚀**
