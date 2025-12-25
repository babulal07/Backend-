const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseStatistics
} = require('../controllers/courseController');
const { authenticate, requireAdmin, requireStudentOrAdmin } = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all courses (with pagination and filtering)
// @access  Private (Students can view courses, Admin can manage)
router.get('/', authenticate, requireStudentOrAdmin, getAllCourses);

// @route   GET /api/courses/statistics
// @desc    Get course statistics
// @access  Private (Admin only)
router.get('/statistics', authenticate, requireAdmin, getCourseStatistics);

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Private (Students and Admin)
router.get('/:id', authenticate, requireStudentOrAdmin, getCourseById);

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Admin only)
router.post('/', authenticate, requireAdmin, createCourse);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Admin only)
router.put('/:id', authenticate, requireAdmin, updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Admin only)
router.delete('/:id', authenticate, requireAdmin, deleteCourse);

module.exports = router;