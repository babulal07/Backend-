# Student and Course Management System

A comprehensive full-stack web application for managing students and their course enrollments. Built with React, Node.js/Express, and MySQL with JWT authentication and role-based access control.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token handling
- **Role-based access control** (Admin and Student roles)
- **Password hashing** using bcryptjs
- **Session management** with automatic token refresh

### 👨‍🎓 Student Management
- **Student registration** with course assignment
- **Profile management** and updates
- **Student search and filtering**
- **Status tracking** (Active, Inactive, Graduated, Suspended)
- **GPA tracking** and academic records

### 📚 Course Management
- **Course CRUD operations** (Admin only)
- **Course enrollment** and capacity management
- **Course statistics** and analytics
- **Duration and description** management

### 📊 Dashboard & Analytics
- **Admin dashboard** with system-wide statistics
- **Student dashboard** with personal information
- **Course utilization** and enrollment metrics
- **Real-time data** updates

### 🛡️ Security Features
- **Input validation** using Joi
- **SQL injection protection** with prepared statements
- **Rate limiting** to prevent abuse
- **CORS configuration** for secure API access
- **Helmet.js** for additional security headers

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - Frontend library
- **React Router** - Client-side routing
- **React Bootstrap** - UI components
- **Axios** - HTTP client
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **React Toastify** - Notifications
- **Lucide React** - Icons

### Database
- **MySQL 8.0+** - Primary database
- **Stored Procedures** - Complex operations
- **Triggers** - Data consistency
- **Indexes** - Performance optimization

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn** package manager
- **MySQL** (v8.0 or higher)
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd student-course-management
```

### 2. Database Setup

1. **Install MySQL** and create a database:
```sql
CREATE DATABASE student_course_db;
```

2. **Run the database schema**:
```bash
mysql -u root -p student_course_db < database/schema.sql
```

3. **Create stored procedures**:
```bash
mysql -u root -p student_course_db < database/stored_procedures.sql
```

4. **Insert sample data** (optional):
```bash
mysql -u root -p student_course_db < database/sample_data.sql
```

### 3. Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
```bash
cp .env.example .env
```

4. **Configure environment variables** in `.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_course_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_secure
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

5. **Start the backend server**:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:5000`

### 4. Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd ../frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the frontend development server**:
```bash
npm start
```

The frontend application will start on `http://localhost:3000`

## 🔧 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - User logout

### Student Endpoints
- `GET /api/students` - Get all students (Admin only)
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student (Admin only)
- `GET /api/students/course/:courseId` - Get students by course

### Course Endpoints
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Admin only)
- `PUT /api/courses/:id` - Update course (Admin only)
- `DELETE /api/courses/:id` - Delete course (Admin only)
- `GET /api/courses/statistics` - Get course statistics (Admin only)

## 👥 Default Users

The system comes with pre-configured demo users:

### Admin User
- **Email**: `admin@university.com`
- **Password**: `password123`
- **Role**: Admin
- **Access**: Full system access

### Student User
- **Email**: `john.doe@email.com`
- **Password**: `password123`
- **Role**: Student
- **Access**: Limited to own data

## 🗂️ Project Structure

```
student-course-management/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/           # Data models (if using ORM)
│   │   ├── routes/           # API routes
│   │   └── utils/            # Utility functions
│   ├── server.js             # Main server file
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables
├── frontend/                  # React frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── package.json         # Frontend dependencies
├── database/                 # Database files
│   ├── schema.sql           # Database schema
│   ├── stored_procedures.sql # Stored procedures
│   └── sample_data.sql      # Sample data
└── README.md               # This file
```

## 🧪 Testing

### API Testing with Postman

1. **Import the API collection** (if provided)
2. **Set environment variables**:
   - `base_url`: `http://localhost:5000/api`
   - `token`: JWT token from login response

3. **Test authentication**:
   - Register a new student
   - Login with credentials
   - Access protected endpoints

### Manual Testing Steps

1. **Start both backend and frontend servers**
2. **Open** `http://localhost:3000` in your browser
3. **Test login** with demo credentials
4. **Navigate through different features**:
   - Dashboard (both admin and student views)
   - Course management
   - Student management (admin only)
   - Profile updates

## 🚀 Deployment

### Backend Deployment
1. **Set production environment variables**
2. **Use a process manager** like PM2:
```bash
npm install -g pm2
pm2 start server.js --name "student-api"
```

### Frontend Deployment
1. **Build the production version**:
```bash
npm run build
```
2. **Serve static files** using a web server like Nginx

### Database Deployment
1. **Use a managed MySQL service** (AWS RDS, Google Cloud SQL, etc.)
2. **Configure SSL connections** for security
3. **Set up automated backups**

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env` files to version control
- **JWT Secrets**: Use strong, unique secrets in production
- **Database Security**: Use strong passwords and limit access
- **HTTPS**: Always use HTTPS in production
- **Input Validation**: All inputs are validated on both client and server
- **SQL Injection**: Protection through prepared statements
- **XSS Protection**: Helmet.js provides security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the **troubleshooting section** below
2. Review the **API documentation**
3. Open an issue on GitHub
4. Contact the development team

## 🔧 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

**Frontend Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

**Authentication Issues**
- Verify JWT_SECRET is set
- Check token expiration
- Clear browser localStorage

**API Errors**
- Check backend server is running
- Verify CORS configuration
- Check network connectivity

## 🎯 Future Enhancements

- **File Upload**: Profile pictures and documents
- **Email Notifications**: Course enrollment confirmations
- **Advanced Reporting**: Detailed analytics and exports
- **Mobile App**: React Native mobile application
- **Integration**: LMS and payment gateway integration
- **Multi-language Support**: Internationalization
- **Advanced Search**: Elasticsearch integration

## 📞 Contact

For questions or support, please contact:
- **Developer**: [Your Name]
- **Email**: [your.email@example.com]
- **GitHub**: [your-github-username]

---

Made with ❤️ for educational purposes