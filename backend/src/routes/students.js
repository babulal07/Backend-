const express = require('express');
const router = express.Router();
const {
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentsByCourse
} = require('../controllers/studentController');
const { 
    authenticate, 
    requireAdmin, 
    requireStudentOrAdmin, 
    checkStudentAccess 
} = require('../middleware/auth');

// @route   GET /api/students
// @desc    Get all students (with pagination and filtering)
// @access  Private (Admin only)
router.get('/', authenticate, requireAdmin, getAllStudents);

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private (Admin or own data)
router.get('/:id', authenticate, requireStudentOrAdmin, checkStudentAccess, getStudentById);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin or own data)
router.put('/:id', authenticate, requireStudentOrAdmin, checkStudentAccess, updateStudent);

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin only)
router.delete('/:id', authenticate, requireAdmin, deleteStudent);

// @route   GET /api/students/course/:courseId
// @desc    Get all students enrolled in a specific course
// @access  Private (Admin only)
router.get('/course/:courseId', authenticate, requireAdmin, getStudentsByCourse);

module.exports = router;