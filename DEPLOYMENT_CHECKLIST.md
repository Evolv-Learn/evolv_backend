# 🚀 Deployment Checklist

Quick checklist for deploying Evolv Learning Platform

---

## ✅ Pre-Deployment

### Code Preparation
- [ ] All code committed to Git
- [ ] .gitignore properly configured
- [ ] No sensitive data in code
- [ ] All migrations created and tested locally
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend runs with production settings

### Accounts Setup
- [ ] GitHub account created
- [ ] Render account created (https://render.com)
- [ ] Vercel account created (https://vercel.com)

---

## 🗄️ Backend (Render)

### Files to Create
- [ ] `evolv_backend/build.sh` script
- [ ] Update `requirements.txt` with production packages
- [ ] Update `settings.py` for production

### Render Setup
- [ ] Create PostgreSQL database on Render
- [ ] Copy Internal Database URL
- [ ] Create Web Service
- [ ] Configure build command: `./build.sh`
- [ ] Configure start command: `gunicorn evolv_backend.wsgi:application`

### Environment Variables (Render)
- [ ] `DEBUG=False`
- [ ] `SECRET_KEY=<generated-key>`
- [ ] `DATABASE_URL=<from-render-db>`
- [ ] `ALLOWED_HOSTS=evolv-backend.onrender.com`
- [ ] `FRONTEND_ORIGINS=https://your-app.vercel.app`
- [ ] Email settings (optional)

### Post-Deploy Backend
- [ ] Visit API root: `https://evolv-backend.onrender.com/api/v1/`
- [ ] Access admin: `https://evolv-backend.onrender.com/admin/`
- [ ] Run migrations via Render shell
- [ ] Create superuser
- [ ] Create default categories

---

## 🎨 Frontend (Vercel)

### Files to Update
- [ ] Create `.env.production` with API URL
- [ ] Update `next.config.js` with image domains
- [ ] Test build locally

### Vercel Setup
- [ ] Import GitHub repository
- [ ] Select Next.js framework
- [ ] Configure root directory

### Environment Variables (Vercel)
- [ ] `NEXT_PUBLIC_API_URL=https://evolv-backend.onrender.com/api/v1`

### Post-Deploy Frontend
- [ ] Visit deployed site
- [ ] Test login functionality
- [ ] Test course browsing
- [ ] Check API connectivity

---

## 🔗 Connect Frontend & Backend

- [ ] Update backend CORS with Vercel URL
- [ ] Update backend ALLOWED_HOSTS
- [ ] Redeploy backend
- [ ] Test frontend → backend connection
- [ ] Test image uploads
- [ ] Test all API endpoints

---

## 🔒 Security

- [ ] DEBUG is False in production
- [ ] Strong SECRET_KEY generated
- [ ] HTTPS enabled (automatic)
- [ ] CORS properly configured
- [ ] Admin password is strong
- [ ] Database credentials secured
- [ ] No .env files in Git

---

## 🧪 Testing

- [ ] Homepage loads
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Course browsing works
- [ ] Admin dashboard accessible
- [ ] Category management works
- [ ] Image uploads work
- [ ] API documentation accessible

---

## 📊 Database

- [ ] Migrations applied
- [ ] Superuser created
- [ ] Default categories created
- [ ] Test data added (optional)
- [ ] Backups configured

---

## 🎯 Optional Enhancements

- [ ] Custom domain configured
- [ ] Email service configured (SendGrid/Mailgun)
- [ ] File storage configured (AWS S3/Cloudinary)
- [ ] Monitoring setup (Sentry)
- [ ] Analytics setup (Google Analytics)
- [ ] SSL certificate (automatic on Render/Vercel)

---

## 📝 Documentation

- [ ] Update README with live URLs
- [ ] Document environment variables
- [ ] Create user guide
- [ ] Document API endpoints

---

## 🎉 Launch

- [ ] All tests passing
- [ ] All features working
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Backups configured
- [ ] Monitoring active

---

## 📞 Post-Launch

- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Plan improvements

---

**Deployment URLs:**

- Backend: https://evolv-backend.onrender.com
- Frontend: https://your-project.vercel.app
- Admin: https://evolv-backend.onrender.com/admin/
- API Docs: https://evolv-backend.onrender.com/api/docs/

---

**Need Help?**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Django Deployment: https://docs.djangoproject.com/en/stable/howto/deployment/
