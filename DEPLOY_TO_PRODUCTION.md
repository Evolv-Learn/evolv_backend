# Quick Deployment Guide 🚀

## What's New in This Release

### Backend:
- ✅ Organized file structure (videos, documents, spreadsheets, archives, others)
- ✅ Auto-detection of file types based on extension
- ✅ Dynamic learning materials for all approved courses
- ✅ Fixed Event pagination warning
- ✅ Fixed CourseMaterial link attribute error

### Frontend:
- ✅ Collapsible folder structure (2-level: Course Files → Subfolders → Files)
- ✅ External links section (GitHub, Discord)
- ✅ Clean UI with file metadata display
- ✅ Download buttons for each file

---

## Deploy Now (Simple Steps)

### Step 1: Commit All Changes
```bash
# From project root
git add .
git commit -m "Add organized file structure and collapsible folders for learning materials"
```

### Step 2: Push to Production
```bash
git push origin main
```

**That's it!** Your Azure App Service workflow will automatically:
1. Deploy backend to Azure
2. Run migrations
3. Collect static files
4. Restart the service

---

## After Deployment

### 1. Verify Backend (5 minutes after push)
Visit: `https://your-backend.azurewebsites.net/api/v1/students/me/learning-materials/`

Expected: JSON response with materials organized by type

### 2. Verify Frontend
Visit: `https://your-frontend-url.com/materials`

Expected:
- See "Course Files" folder (closed by default)
- Click to expand → See subfolders (Videos, Documents, etc.)
- Click subfolder → See files with download buttons

---

## If You Need to Run Migrations Manually

Only if automatic migration fails:

1. Go to Azure Portal
2. Navigate to your App Service
3. Open SSH/Console
4. Run:
```bash
cd /home/site/wwwroot
python manage.py migrate
```

---

## Environment Variables (Already Configured)

### Backend:
- ✅ `DEBUG=False`
- ✅ `ALLOWED_HOSTS` configured
- ✅ `DATABASE_URL` configured
- ✅ `SECRET_KEY` configured

### Frontend:
- ✅ `NEXT_PUBLIC_API_URL` configured
- ✅ Production build settings ready

---

## Testing Checklist After Deployment

### Backend:
- [ ] API responds at `/api/v1/students/me/learning-materials/`
- [ ] File uploads go to correct subfolders
- [ ] External links (GitHub, Discord) are returned

### Frontend:
- [ ] Learning materials page loads
- [ ] Folders are collapsible
- [ ] Files download correctly
- [ ] External links are clickable

---

## Files Changed (For Reference)

### Backend:
- `evolv_backend/courses/models.py`
- `evolv_backend/courses/views_extended.py`
- `evolv_backend/courses/migrations/0025_*.py`
- `evolv_backend/courses/migrations/0026_*.py`

### Frontend:
- `evolv_frontend/src/app/materials/page.tsx`

### Configuration:
- `evolv_backend/requirements.txt` (already up to date)

---

## Ready to Deploy! ✅

All files are production-ready. Just commit and push!

```bash
git add .
git commit -m "Add organized file structure and collapsible folders"
git push origin main
```
