# 🎓 Student and Course Management System - Complete & Ready!

## ✅ **Project Status: FULLY FUNCTIONAL**

This is a complete full-stack web application for managing students and their course enrollments, with JWT authentication and role-based access control.

---

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v16.0.0+)
- MySQL (v8.0+)
- npm or yarn

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/babulal07/Backend-.git
cd Backend-
```

2. **Set up the database**
```bash
# Login to MySQL
mysql -u root -p

# Run the setup script
mysql -u root -p < database/schema.sql
```

3. **Configure Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL password and JWT secret
npm run dev
```

4. **Configure Frontend**
```bash
cd frontend
npm install
npm start
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📊 **Current Database Content**

### Courses (10 Total)
1. Computer Science Fundamentals (CS101) - 30 students max
2. Web Development Bootcamp (WEB201) - 25 students max
3. Data Science and Analytics (DS301) - 20 students max
4. Mobile App Development (MOB401) - 20 students max
5. Cybersecurity Essentials (CYB501) - 15 students max
6. Advanced JavaScript (JS401) - 25 students max
7. Database Design (DB301) - 30 students max
8. Cloud Computing (CLOUD501) - 20 students max
9. UI/UX Design (UX201) - 25 students max
10. DevOps Engineering (DEVOPS401) - 15 students max

### Students (15 Total)
- **Active Students**: 13
- **Graduated Students**: 2
- **Inactive Students**: 1
- **Average GPA**: ~3.80

---

## 🔐 **Login Credentials**

### Admin Account
- **Email**: admin@university.com
- **Password**: password123
- **Access**: Full system access (manage students, courses, view all data)

### Student Accounts
- **Email**: john.doe@email.com
- **Password**: password123
- **Access**: View own profile and enrolled courses

*All student accounts use the same password: `password123`*

---

## 🛠️ **Technology Stack**

### Backend
- Node.js & Express.js
- MySQL with prepared statements
- JWT authentication
- bcryptjs for password hashing
- Joi for validation
- Helmet for security
- CORS enabled

### Frontend
- React 18
- React Router for navigation
- React Bootstrap for UI
- Axios for API calls
- React Toastify for notifications
- Lucide React for icons

---

## 📁 **Project Structure**

```
student-course-management/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth & error handling
│   │   ├── routes/         # API routes
│   │   └── utils/          # JWT & validation
│   ├── server.js           # Main server file
│   ├── setup-db.js         # Database setup script
│   └── seed-data.js        # Sample data seeder
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── services/       # API services
│   └── package.json
├── database/
│   ├── schema.sql          # Database schema
│   ├── stored_procedures.sql
│   └── sample_data.sql
└── README.md
```

---

## 🔧 **API Endpoints**

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Students
- `GET /api/students` - Get all students (Admin only)
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student (Admin only)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Admin only)
- `PUT /api/courses/:id` - Update course (Admin only)
- `DELETE /api/courses/:id` - Delete course (Admin only)
- `GET /api/courses/statistics` - Get course statistics (Admin only)

---

## ✨ **Features**

### ✅ Implemented & Working
- [x] JWT-based authentication
- [x] Role-based access control (Admin/Student)
- [x] Student CRUD operations
- [x] Course CRUD operations
- [x] Dashboard with real-time statistics
- [x] Course enrollment management
- [x] GPA tracking
- [x] Status management (Active, Inactive, Graduated, Suspended)
- [x] Search and filtering
- [x] Pagination support
- [x] Input validation
- [x] Error handling
- [x] Security middleware (Helmet, CORS, Rate limiting)

---

## 🐛 **Known Issues & Solutions**

### Issue: MySQL2 LIMIT/OFFSET Error
**Fixed!** The application previously had issues with LIMIT and OFFSET placeholders in prepared statements. This has been resolved by using direct values instead of placeholders.

### Issue: GROUP BY Clause
**Fixed!** All GROUP BY clauses now include all non-aggregated columns to comply with MySQL's ONLY_FULL_GROUP_BY mode.

---

## 📝 **Important Notes**

1. **Database Setup**: Make sure to run `setup-db.js` and `seed-data.js` to populate the database with sample data
2. **Environment Variables**: Always configure your `.env` file with secure credentials
3. **Port Configuration**: Backend runs on port 5000, Frontend on port 3000
4. **CORS**: Frontend URL is configured in the backend for security

---

## 🚀 **Deployment**

### Backend
```bash
npm install -g pm2
pm2 start server.js --name "student-api"
```

### Frontend
```bash
npm run build
# Serve the build folder with nginx or similar
```

---

## 📞 **Support**

For issues or questions:
- Check the troubleshooting section in the main README
- Review the API documentation
- Open an issue on GitHub

---

## 📄 **License**

MIT License - See LICENSE file for details

---

**Made with ❤️ for educational purposes**

🔗 **GitHub Repository**: https://github.com/babulal07/Backend-
