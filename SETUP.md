# Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Database Setup
1. Open MySQL and run these commands:
```sql
CREATE DATABASE student_course_db;
USE student_course_db;
SOURCE database/schema.sql;
SOURCE database/stored_procedures.sql;
SOURCE database/sample_data.sql;
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL password
npm run dev
```

### Step 3: Frontend Setup (in new terminal)
```bash
cd frontend
npm install
npm start
```

### Step 4: Test the Application
1. Open http://localhost:3000
2. Login with:
   - **Admin**: admin@university.com / password123
   - **Student**: john.doe@email.com / password123

## 🔧 Environment Variables

Update `backend/.env`:
```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_very_long_secret_key
```

## ✅ Verification Checklist

- [ ] MySQL server running
- [ ] Database created and populated
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login with demo credentials
- [ ] Dashboard loads correctly

## 🛠️ Testing with Postman

1. Import `postman_collection.json`
2. Set environment variable: `base_url` = `http://localhost:5000/api`
3. Run "Login" request first to get token
4. Test other endpoints

## 🆘 Troubleshooting

**Database Connection Error?**
- Check MySQL is running
- Verify password in .env file
- Ensure database exists

**Frontend Not Loading?**
- Check console for errors
- Verify backend is running
- Clear browser cache

**API Errors?**
- Check JWT_SECRET is set
- Verify token in requests
- Check server logs