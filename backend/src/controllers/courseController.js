const { executeQuery } = require('../config/database');
const { courseSchema, updateCourseSchema, paginationSchema } = require('../utils/validation');

// Get all courses (with pagination and filtering)
const getAllCourses = async (req, res) => {
    try {
        // Validate pagination parameters
        const { error, value } = paginationSchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pagination parameters',
                details: error.details.map(detail => detail.message)
            });
        }

        const { page, limit, sortBy, sortOrder } = value;
        const offset = (page - 1) * limit;

        // Map sortBy to actual column names
        const sortByMap = {
            'name': 'course_name',
            'course_name': 'course_name',
            'created_at': 'created_at',
            'email': 'created_at' // fallback for invalid field
        };
        const actualSortBy = sortByMap[sortBy] || 'created_at';

        // Build search conditions
        const searchConditions = [];
        const searchParams = [];

        if (req.query.search) {
            searchConditions.push(`(
                course_name LIKE ? OR 
                course_code LIKE ? OR 
                course_description LIKE ?
            )`);
            const searchTerm = `%${req.query.search}%`;
            searchParams.push(searchTerm, searchTerm, searchTerm);
        }

        if (req.query.minDuration) {
            searchConditions.push('course_duration >= ?');
            searchParams.push(req.query.minDuration);
        }

        if (req.query.maxDuration) {
            searchConditions.push('course_duration <= ?');
            searchParams.push(req.query.maxDuration);
        }

        const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';

        // Count total records
        const countQuery = `SELECT COUNT(*) as total FROM courses ${whereClause}`;
        const [totalResult] = await executeQuery(countQuery, searchParams);
        const total = totalResult.total;

        // Get courses with student count
        const coursesQuery = `
            SELECT 
                c.course_id,
                c.course_name,
                c.course_code,
                c.course_duration,
                c.course_description,
                c.max_students,
                c.created_at,
                c.updated_at,
                COUNT(s.student_id) as enrolled_students
            FROM courses c
            LEFT JOIN students s ON c.course_id = s.course_id AND s.status = 'active'
            ${whereClause}
            GROUP BY c.course_id, c.course_name, c.course_code, c.course_duration, c.course_description, c.max_students, c.created_at, c.updated_at
            ORDER BY c.${actualSortBy} ${sortOrder}
            LIMIT ${limit} OFFSET ${offset}
        `;

        console.log('📝 Courses Query:', coursesQuery);
        console.log('📊 Query Params:', searchParams);

        const courses = await executeQuery(coursesQuery, searchParams);

        res.json({
            success: true,
            message: 'Courses retrieved successfully',
            data: {
                courses: courses.map(course => ({
                    id: course.course_id,
                    name: course.course_name,
                    code: course.course_code,
                    duration: course.course_duration,
                    description: course.course_description,
                    maxStudents: course.max_students,
                    enrolledStudents: course.enrolled_students,
                    availableSlots: course.max_students - course.enrolled_students,
                    createdAt: course.created_at,
                    updatedAt: course.updated_at
                })),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            }
        });

    } catch (error) {
        console.error('❌ Get all courses error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// Get course by ID
const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;

        const courseQuery = `
            SELECT 
                c.*,
                COUNT(s.student_id) as enrolled_students
            FROM courses c
            LEFT JOIN students s ON c.course_id = s.course_id AND s.status = 'active'
            WHERE c.course_id = ?
            GROUP BY c.course_id
        `;

        const courses = await executeQuery(courseQuery, [courseId]);

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const course = courses[0];

        res.json({
            success: true,
            message: 'Course retrieved successfully',
            data: {
                id: course.course_id,
                name: course.course_name,
                code: course.course_code,
                duration: course.course_duration,
                description: course.course_description,
                maxStudents: course.max_students,
                enrolledStudents: course.enrolled_students,
                availableSlots: course.max_students - course.enrolled_students,
                createdAt: course.created_at,
                updatedAt: course.updated_at
            }
        });

    } catch (error) {
        console.error('Get course by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create new course (Admin only)
const createCourse = async (req, res) => {
    try {
        // Validate input
        const { error, value } = courseSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details.map(detail => detail.message)
            });
        }

        const { courseName, courseCode, courseDuration, courseDescription, maxStudents } = value;

        // Check if course code already exists
        const existingCourse = await executeQuery('SELECT course_id FROM courses WHERE course_code = ?', [courseCode]);
        if (existingCourse.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Course code already exists'
            });
        }

        // Insert new course
        const insertQuery = `
            INSERT INTO courses (course_name, course_code, course_duration, course_description, max_students)
            VALUES (?, ?, ?, ?, ?)
        `;

        const result = await executeQuery(insertQuery, [
            courseName,
            courseCode,
            courseDuration,
            courseDescription || null,
            maxStudents || 50
        ]);

        const courseId = result.insertId;

        // Get the created course
        const newCourse = await executeQuery('SELECT * FROM courses WHERE course_id = ?', [courseId]);

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: {
                id: newCourse[0].course_id,
                name: newCourse[0].course_name,
                code: newCourse[0].course_code,
                duration: newCourse[0].course_duration,
                description: newCourse[0].course_description,
                maxStudents: newCourse[0].max_students,
                enrolledStudents: 0,
                availableSlots: newCourse[0].max_students,
                createdAt: newCourse[0].created_at,
                updatedAt: newCourse[0].updated_at
            }
        });

    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update course (Admin only)
const updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Validate input
        const { error, value } = updateCourseSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details.map(detail => detail.message)
            });
        }

        // Check if course exists
        const existingCourse = await executeQuery('SELECT * FROM courses WHERE course_id = ?', [courseId]);
        if (existingCourse.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const { courseName, courseCode, courseDuration, courseDescription, maxStudents } = value;

        // Check if course code already exists (for other courses)
        if (courseCode) {
            const duplicateCourse = await executeQuery(
                'SELECT course_id FROM courses WHERE course_code = ? AND course_id != ?',
                [courseCode, courseId]
            );
            if (duplicateCourse.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Course code already exists'
                });
            }
        }

        // Build update query dynamically
        const updateFields = [];
        const updateParams = [];

        if (courseName !== undefined) {
            updateFields.push('course_name = ?');
            updateParams.push(courseName);
        }
        if (courseCode !== undefined) {
            updateFields.push('course_code = ?');
            updateParams.push(courseCode);
        }
        if (courseDuration !== undefined) {
            updateFields.push('course_duration = ?');
            updateParams.push(courseDuration);
        }
        if (courseDescription !== undefined) {
            updateFields.push('course_description = ?');
            updateParams.push(courseDescription);
        }
        if (maxStudents !== undefined) {
            updateFields.push('max_students = ?');
            updateParams.push(maxStudents);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateParams.push(courseId);

        const updateQuery = `UPDATE courses SET ${updateFields.join(', ')} WHERE course_id = ?`;
        await executeQuery(updateQuery, updateParams);

        // Get updated course with student count
        const updatedCourseQuery = `
            SELECT 
                c.*,
                COUNT(s.student_id) as enrolled_students
            FROM courses c
            LEFT JOIN students s ON c.course_id = s.course_id AND s.status = 'active'
            WHERE c.course_id = ?
            GROUP BY c.course_id
        `;

        const updatedCourse = await executeQuery(updatedCourseQuery, [courseId]);

        res.json({
            success: true,
            message: 'Course updated successfully',
            data: {
                id: updatedCourse[0].course_id,
                name: updatedCourse[0].course_name,
                code: updatedCourse[0].course_code,
                duration: updatedCourse[0].course_duration,
                description: updatedCourse[0].course_description,
                maxStudents: updatedCourse[0].max_students,
                enrolledStudents: updatedCourse[0].enrolled_students,
                availableSlots: updatedCourse[0].max_students - updatedCourse[0].enrolled_students,
                createdAt: updatedCourse[0].created_at,
                updatedAt: updatedCourse[0].updated_at
            }
        });

    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete course (Admin only)
const deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { force } = req.query; // ?force=true to force delete

        // Check if course exists
        const existingCourse = await executeQuery('SELECT * FROM courses WHERE course_id = ?', [courseId]);
        if (existingCourse.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if course has enrolled students
        const enrolledStudents = await executeQuery(
            'SELECT COUNT(*) as count FROM students WHERE course_id = ?',
            [courseId]
        );

        if (enrolledStudents[0].count > 0 && force !== 'true') {
            return res.status(400).json({
                success: false,
                message: `Course has ${enrolledStudents[0].count} enrolled students. Use ?force=true to delete anyway (students will be unenrolled).`
            });
        }

        // If force delete, first unenroll all students
        if (force === 'true') {
            await executeQuery('UPDATE students SET course_id = NULL WHERE course_id = ?', [courseId]);
        }

        // Delete course
        await executeQuery('DELETE FROM courses WHERE course_id = ?', [courseId]);

        res.json({
            success: true,
            message: 'Course deleted successfully',
            ...(force === 'true' && { warning: 'All enrolled students have been unenrolled from this course.' })
        });

    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get course statistics (Admin only)
const getCourseStatistics = async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                c.course_id,
                c.course_name,
                c.course_code,
                c.max_students,
                COUNT(s.student_id) as enrolled_students,
                COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_students,
                COUNT(CASE WHEN s.status = 'graduated' THEN 1 END) as graduated_students,
                COUNT(CASE WHEN s.status = 'inactive' THEN 1 END) as inactive_students,
                COALESCE(AVG(s.gpa), 0) as average_gpa,
                MIN(s.enrollment_date) as first_enrollment,
                MAX(s.enrollment_date) as latest_enrollment
            FROM courses c
            LEFT JOIN students s ON c.course_id = s.course_id
            GROUP BY c.course_id, c.course_name, c.course_code, c.max_students
            ORDER BY c.course_name
        `;

        const stats = await executeQuery(statsQuery);

        res.json({
            success: true,
            message: 'Course statistics retrieved successfully',
            data: stats.map(course => ({
                id: course.course_id,
                name: course.course_name,
                code: course.course_code,
                maxStudents: course.max_students,
                enrolledStudents: course.enrolled_students,
                activeStudents: course.active_students,
                graduatedStudents: course.graduated_students,
                inactiveStudents: course.inactive_students,
                averageGpa: parseFloat(course.average_gpa).toFixed(2),
                firstEnrollment: course.first_enrollment,
                latestEnrollment: course.latest_enrollment,
                utilizationRate: course.max_students > 0 ?
                    ((course.enrolled_students / course.max_students) * 100).toFixed(1) + '%' : '0%'
            }))
        });

    } catch (error) {
        console.error('Get course statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseStatistics
};