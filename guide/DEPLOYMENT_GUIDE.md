# EvolvLearn - Deployment & Sharing Guide

## 📦 Sharing with Your Team

### Option 1: Git Repository (Recommended)

1. **Initialize Git (if not already done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - EvolvLearn platform"
   ```

2. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/yourusername/evolvlearn.git
   git branch -M main
   git push -u origin main
   ```

3. **Team members can clone**
   ```bash
   git clone https://github.com/yourusername/evolvlearn.git
   cd evolvlearn
   ```

### Option 2: Zip File

1. **Create a zip file** (exclude node_modules and virtual environments)
   - Right-click the project folder
   - Select "Send to" > "Compressed (zipped) folder"
   - Share via Google Drive, Dropbox, or email

2. **Team members extract and setup**

---

## 🚀 Setup Instructions for Team Members

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL (or use SQLite for testing)

### Backend Setup

1. **Create virtual environment** (from project root)
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

2. **Install dependencies** (from project root)
   ```bash
   pip install -r requirements.txt
   ```

3. **Navigate to backend folder**
   ```bash
   cd evolv_backend
   ```

4. **Setup environment variables**
   - Copy `.env.example` to `.env` (if exists)
   - Or create `.env` with:
   ```
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=sqlite:///db.sqlite3
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start backend server**
   ```bash
   python manage.py runserver
   ```
   Backend will run on: http://localhost:8000

### Frontend Setup

1. **Navigate to frontend folder** (in a new terminal)
   ```bash
   cd evolv_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   - Create `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will run on: http://localhost:3000

---

## 🌐 Testing the Application

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

### Test Accounts
Create test accounts using the registration page or Django admin panel.

### Key Features to Test
1. ✅ Homepage with hero section
2. ✅ Navigation dropdowns (Companies, About Us)
3. ✅ User registration and login
4. ✅ Course browsing
5. ✅ Events page
6. ✅ Company pages (Partner, Hire Talents, Train Staff, etc.)
7. ✅ About pages (Values, Impacts)

---

## 📝 Current Project Status

### ✅ Completed Features
- Homepage with centered hero section
- Responsive navigation with dropdowns
- User authentication (register/login)
- Course management system
- Events system
- Student model and API
- Company pages (Partner, Hire, Train, Events, Sponsorship)
- About pages (Values, Impacts)
- Alumni page
- Contact page

### 🚧 In Progress / TODO
- Admission multi-step form
- Dashboard functionality
- Course enrollment system
- Payment integration
- Email notifications

---

## 🐛 Troubleshooting

### Backend Issues
- **Port already in use**: Change port with `python manage.py runserver 8001`
- **Database errors**: Delete `db.sqlite3` and run migrations again
- **Module not found**: Ensure virtual environment is activated

### Frontend Issues
- **Port 3000 in use**: Next.js will prompt to use 3001
- **API connection errors**: Check `NEXT_PUBLIC_API_URL` in `.env.local`
- **Module errors**: Delete `node_modules` and run `npm install` again

---

## 📞 Support

If team members have issues:
1. Check this guide first
2. Verify all prerequisites are installed
3. Ensure both backend and frontend are running
4. Check browser console for errors (F12)

---

## 🔐 Important Notes

- **Never commit `.env` files** to Git (they contain secrets)
- **Keep `node_modules` and `venv` out of Git** (use `.gitignore`)
- **Use the same Python/Node versions** for consistency
- **Backend must run before frontend** for API calls to work

---

Good luck with testing! 🚀
