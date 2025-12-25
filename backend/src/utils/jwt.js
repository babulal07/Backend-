const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'student-course-api',
        audience: 'student-course-app'
    });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'student-course-api',
            audience: 'student-course-app'
        });
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Generate refresh token
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '30d',
        issuer: 'student-course-api',
        audience: 'student-course-app'
    });
};

module.exports = {
    generateToken,
    verifyToken,
    generateRefreshToken
};