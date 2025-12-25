const { verifyToken } = require('../utils/jwt');
const { executeQuery } = require('../config/database');

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided or invalid format.'
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify the token
        const decoded = verifyToken(token);
        
        // Get user details from database
        const userQuery = 'SELECT user_id, email, role, first_name, last_name FROM users WHERE user_id = ?';
        const users = await executeQuery(userQuery, [decoded.userId]);
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// Authorization middleware for admin only
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Authorization middleware for student access (can access own data or admin can access all)
const requireStudentOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'student')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Student or Admin privileges required.'
        });
    }
};

// Check if user can access specific student data
const checkStudentAccess = async (req, res, next) => {
    try {
        const studentId = req.params.id || req.params.studentId;
        
        // Admin can access all students
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Students can only access their own data
        if (req.user.role === 'student') {
            const studentQuery = 'SELECT student_id FROM students WHERE user_id = ?';
            const students = await executeQuery(studentQuery, [req.user.user_id]);
            
            if (students.length === 0 || students[0].student_id.toString() !== studentId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only access your own data.'
                });
            }
        }
        
        next();
    } catch (error) {
        console.error('Student access check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking access permissions.'
        });
    }
};

module.exports = {
    authenticate,
    requireAdmin,
    requireStudentOrAdmin,
    checkStudentAccess
};