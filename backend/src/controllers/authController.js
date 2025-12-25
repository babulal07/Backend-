const bcrypt = require('bcryptjs');
const { executeQuery, callStoredProcedure } = require('../config/database');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { registerSchema, loginSchema } = require('../utils/validation');

// Register a new user (student)
const register = async (req, res) => {
    try {
        // Validate input
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details.map(detail => detail.message)
            });
        }

        const { email, password, firstName, lastName, studentNumber, courseId, phone, address } = value;

        // Check if user already exists
        const existingUser = await executeQuery('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Check if student number already exists
        const existingStudent = await executeQuery('SELECT student_id FROM students WHERE student_number = ?', [studentNumber]);
        if (existingStudent.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Student number already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Use stored procedure to create student with course
        const result = await executeQuery(
            'CALL InsertStudentWithCourse(?, ?, ?, ?, ?, ?, ?, ?, @student_id, @result_message)',
            [email, passwordHash, firstName, lastName, studentNumber, courseId || null, phone || null, address || null]
        );

        // Get the output parameters
        const output = await executeQuery('SELECT @student_id as student_id, @result_message as result_message');
        const { student_id, result_message } = output[0];

        if (!student_id || student_id === 0) {
            return res.status(400).json({
                success: false,
                message: result_message || 'Failed to create student'
            });
        }

        // Get the created user details
        const userQuery = `
            SELECT u.user_id, u.email, u.role, u.first_name, u.last_name,
                   s.student_id, s.student_number
            FROM users u
            JOIN students s ON u.user_id = s.user_id
            WHERE s.student_id = ?
        `;
        const userDetails = await executeQuery(userQuery, [student_id]);
        const user = userDetails[0];

        // Generate tokens
        const token = generateToken({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        const refreshToken = generateRefreshToken({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: {
                user: {
                    id: user.user_id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    studentId: user.student_id,
                    studentNumber: user.student_number
                },
                token,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details.map(detail => detail.message)
            });
        }

        const { email, password } = value;

        // Get user from database
        const userQuery = `
            SELECT u.user_id, u.email, u.password_hash, u.role, u.first_name, u.last_name,
                   s.student_id, s.student_number, s.status
            FROM users u
            LEFT JOIN students s ON u.user_id = s.user_id
            WHERE u.email = ?
        `;
        const users = await executeQuery(userQuery, [email]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if student account is active (if user is a student)
        if (user.role === 'student' && user.status && user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: `Account is ${user.status}. Please contact administration.`
            });
        }

        // Generate tokens
        const token = generateToken({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        const refreshToken = generateRefreshToken({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.user_id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    ...(user.student_id && {
                        studentId: user.student_id,
                        studentNumber: user.student_number,
                        status: user.status
                    })
                },
                token,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const userQuery = `
            SELECT u.user_id, u.email, u.role, u.first_name, u.last_name, u.created_at,
                   s.student_id, s.student_number, s.enrollment_date, s.status, s.gpa, s.phone, s.address,
                   c.course_id, c.course_name, c.course_code, c.course_duration
            FROM users u
            LEFT JOIN students s ON u.user_id = s.user_id
            LEFT JOIN courses c ON s.course_id = c.course_id
            WHERE u.user_id = ?
        `;
        
        const users = await executeQuery(userQuery, [userId]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];
        
        const profile = {
            id: user.user_id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            createdAt: user.created_at
        };

        // Add student-specific data if user is a student
        if (user.student_id) {
            profile.studentInfo = {
                studentId: user.student_id,
                studentNumber: user.student_number,
                enrollmentDate: user.enrollment_date,
                status: user.status,
                gpa: user.gpa,
                phone: user.phone,
                address: user.address,
                course: user.course_id ? {
                    id: user.course_id,
                    name: user.course_name,
                    code: user.course_code,
                    duration: user.course_duration
                } : null
            };
        }

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: profile
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Logout (in a real application, you might maintain a blacklist of tokens)
const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

module.exports = {
    register,
    login,
    getProfile,
    logout
};