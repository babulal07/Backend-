const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./src/config/database');
const { errorHandler, notFound, validationError } = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/auth');
const studentRoutes = require('./src/routes/students');
const courseRoutes = require('./src/routes/courses');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Student Course Management API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile',
                logout: 'POST /api/auth/logout'
            },
            students: {
                getAllStudents: 'GET /api/students',
                getStudentById: 'GET /api/students/:id',
                updateStudent: 'PUT /api/students/:id',
                deleteStudent: 'DELETE /api/students/:id',
                getStudentsByCourse: 'GET /api/students/course/:courseId'
            },
            courses: {
                getAllCourses: 'GET /api/courses',
                getCourseById: 'GET /api/courses/:id',
                createCourse: 'POST /api/courses',
                updateCourse: 'PUT /api/courses/:id',
                deleteCourse: 'DELETE /api/courses/:id',
                getCourseStatistics: 'GET /api/courses/statistics'
            }
        },
        documentation: {
            postman: 'Import the Postman collection for detailed API testing',
            swagger: 'Swagger documentation available at /api/docs (if enabled)'
        }
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);

// Error handling middleware
app.use(validationError);
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Please check your database configuration.');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log('🚀 Student Course Management Server');
            console.log(`📍 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
            console.log(`💖 Health Check: http://localhost:${PORT}/health`);
            console.log('🎯 Ready to accept connections!');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();