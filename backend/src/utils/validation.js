const Joi = require('joi');

// User registration validation schema
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    studentNumber: Joi.string().alphanum().min(5).max(20).required(),
    courseId: Joi.number().integer().positive().optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-()]+$/).optional(),
    address: Joi.string().max(500).optional()
});

// User login validation schema
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Course creation validation schema
const courseSchema = Joi.object({
    courseName: Joi.string().min(3).max(100).required(),
    courseCode: Joi.string().alphanum().min(3).max(20).required(),
    courseDuration: Joi.number().integer().positive().max(104).required(), // Max 2 years in weeks
    courseDescription: Joi.string().max(1000).optional(),
    maxStudents: Joi.number().integer().positive().max(1000).optional()
});

// Student update validation schema
const updateStudentSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    courseId: Joi.number().integer().positive().allow(null).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-()]+$/).optional(),
    address: Joi.string().max(500).optional(),
    status: Joi.string().valid('active', 'inactive', 'graduated', 'suspended').optional()
});

// Course update validation schema
const updateCourseSchema = Joi.object({
    courseName: Joi.string().min(3).max(100).optional(),
    courseCode: Joi.string().alphanum().min(3).max(20).optional(),
    courseDuration: Joi.number().integer().positive().max(104).optional(),
    courseDescription: Joi.string().max(1000).optional(),
    maxStudents: Joi.number().integer().positive().max(1000).optional()
});

// Pagination validation schema
const paginationSchema = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().max(100).default(10),
    sortBy: Joi.string().valid('name', 'email', 'created_at', 'course_name').default('created_at'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
});

module.exports = {
    registerSchema,
    loginSchema,
    courseSchema,
    updateStudentSchema,
    updateCourseSchema,
    paginationSchema
};