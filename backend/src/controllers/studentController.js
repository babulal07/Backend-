const { executeQuery, callStoredProcedure } = require('../config/database');
const { updateStudentSchema, paginationSchema } = require('../utils/validation');

// Get all students (with pagination and filtering)
const getAllStudents = async (req, res) => {
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

        // Build search conditions
        const searchConditions = [];
        const searchParams = [];

        if (req.query.search) {
            searchConditions.push(`(
                u.first_name LIKE ? OR 
                u.last_name LIKE ? OR 
                u.email LIKE ? OR 
                s.student_number LIKE ?
            )`);
            const searchTerm = `%${req.query.search}%`;
            searchParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (req.query.courseId) {
            searchConditions.push('s.course_id = ?');
            searchParams.push(req.query.courseId);
        }

        if (req.query.status) {
            searchConditions.push('s.status = ?');
            searchParams.push(req.query.status);
        }

        const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';

        // Count total records
        const countQuery = `
            SELECT COUNT(*) as total
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN courses c ON s.course_id = c.course_id
            ${whereClause}
        `;
        const [totalResult] = await executeQuery(countQuery, searchParams);
        const total = totalResult.total;

        // Get students with pagination
        // Map sortBy to avoid SQL injection
        const sortByMap = {
            'name': 'u.last_name',
            'course_name': 'c.course_name',
            'created_at': 's.created_at',
            'email': 'u.email'
        };
        const actualSortBy = sortByMap[sortBy] || 's.created_at';

        const studentsQuery = `
            SELECT 
                s.student_id,
                s.student_number,
                u.first_name,
                u.last_name,
                u.email,
                s.enrollment_date,
                s.status,
                s.gpa,
                s.phone,
                s.address,
                c.course_id,
                c.course_name,
                c.course_code,
                c.course_duration,
                s.created_at
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN courses c ON s.course_id = c.course_id
            ${whereClause}
            ORDER BY ${actualSortBy} ${sortOrder}
            LIMIT ${limit} OFFSET ${offset}
        `;

        const students = await executeQuery(studentsQuery, searchParams);

        res.json({
            success: true,
            message: 'Students retrieved successfully',
            data: {
                students: students.map(student => ({
                    id: student.student_id,
                    studentNumber: student.student_number,
                    firstName: student.first_name,
                    lastName: student.last_name,
                    email: student.email,
                    enrollmentDate: student.enrollment_date,
                    status: student.status,
                    gpa: student.gpa,
                    phone: student.phone,
                    address: student.address,
                    course: student.course_id ? {
                        id: student.course_id,
                        name: student.course_name,
                        code: student.course_code,
                        duration: student.course_duration
                    } : null,
                    createdAt: student.created_at
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
        console.error('Get all students error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get student by ID
const getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;

        const studentQuery = `
            SELECT 
                s.student_id,
                s.student_number,
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                s.enrollment_date,
                s.status,
                s.gpa,
                s.phone,
                s.address,
                c.course_id,
                c.course_name,
                c.course_code,
                c.course_duration,
                c.course_description,
                s.created_at,
                s.updated_at
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN courses c ON s.course_id = c.course_id
            WHERE s.student_id = ?
        `;

        const students = await executeQuery(studentQuery, [studentId]);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const student = students[0];

        res.json({
            success: true,
            message: 'Student retrieved successfully',
            data: {
                id: student.student_id,
                userId: student.user_id,
                studentNumber: student.student_number,
                firstName: student.first_name,
                lastName: student.last_name,
                email: student.email,
                enrollmentDate: student.enrollment_date,
                status: student.status,
                gpa: student.gpa,
                phone: student.phone,
                address: student.address,
                course: student.course_id ? {
                    id: student.course_id,
                    name: student.course_name,
                    code: student.course_code,
                    duration: student.course_duration,
                    description: student.course_description
                } : null,
                createdAt: student.created_at,
                updatedAt: student.updated_at
            }
        });

    } catch (error) {
        console.error('Get student by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update student
const updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Validate input
        const { error, value } = updateStudentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details.map(detail => detail.message)
            });
        }

        // Check if student exists
        const existingStudent = await executeQuery(
            'SELECT user_id FROM students WHERE student_id = ?',
            [studentId]
        );

        if (existingStudent.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const { firstName, lastName, courseId, phone, address, status } = value;

        // Use stored procedure for update if available, otherwise use regular update
        try {
            const result = await executeQuery(
                'CALL UpdateStudentWithCourse(?, ?, ?, ?, ?, ?, ?, @result_message)',
                [studentId, firstName, lastName, courseId, phone, address, status]
            );

            const output = await executeQuery('SELECT @result_message as result_message');
            const { result_message } = output[0];

            if (result_message && result_message.startsWith('Error:')) {
                return res.status(400).json({
                    success: false,
                    message: result_message
                });
            }
        } catch (error) {
            // Fallback to individual updates if stored procedure fails
            console.log('Stored procedure failed, using fallback method:', error.message);

            // Update user info
            if (firstName || lastName) {
                const updateFields = [];
                const updateParams = [];

                if (firstName) {
                    updateFields.push('first_name = ?');
                    updateParams.push(firstName);
                }
                if (lastName) {
                    updateFields.push('last_name = ?');
                    updateParams.push(lastName);
                }

                updateParams.push(existingStudent[0].user_id);

                await executeQuery(
                    `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
                    updateParams
                );
            }

            // Update student info
            const studentUpdateFields = [];
            const studentUpdateParams = [];

            if (courseId !== undefined) {
                studentUpdateFields.push('course_id = ?');
                studentUpdateParams.push(courseId);
            }
            if (phone !== undefined) {
                studentUpdateFields.push('phone = ?');
                studentUpdateParams.push(phone);
            }
            if (address !== undefined) {
                studentUpdateFields.push('address = ?');
                studentUpdateParams.push(address);
            }
            if (status !== undefined) {
                studentUpdateFields.push('status = ?');
                studentUpdateParams.push(status);
            }

            if (studentUpdateFields.length > 0) {
                studentUpdateParams.push(studentId);
                await executeQuery(
                    `UPDATE students SET ${studentUpdateFields.join(', ')} WHERE student_id = ?`,
                    studentUpdateParams
                );
            }
        }

        // Get updated student data
        const updatedStudentQuery = `
            SELECT 
                s.student_id,
                s.student_number,
                u.first_name,
                u.last_name,
                u.email,
                s.enrollment_date,
                s.status,
                s.gpa,
                s.phone,
                s.address,
                c.course_id,
                c.course_name,
                c.course_code,
                c.course_duration
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN courses c ON s.course_id = c.course_id
            WHERE s.student_id = ?
        `;

        const updatedStudent = await executeQuery(updatedStudentQuery, [studentId]);

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: {
                id: updatedStudent[0].student_id,
                studentNumber: updatedStudent[0].student_number,
                firstName: updatedStudent[0].first_name,
                lastName: updatedStudent[0].last_name,
                email: updatedStudent[0].email,
                enrollmentDate: updatedStudent[0].enrollment_date,
                status: updatedStudent[0].status,
                gpa: updatedStudent[0].gpa,
                phone: updatedStudent[0].phone,
                address: updatedStudent[0].address,
                course: updatedStudent[0].course_id ? {
                    id: updatedStudent[0].course_id,
                    name: updatedStudent[0].course_name,
                    code: updatedStudent[0].course_code,
                    duration: updatedStudent[0].course_duration
                } : null
            }
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete student
const deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { force } = req.query; // ?force=true to force delete

        // Check if student exists
        const existingStudent = await executeQuery(
            'SELECT course_id FROM students WHERE student_id = ?',
            [studentId]
        );

        if (existingStudent.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Try to use stored procedure
        try {
            const result = await executeQuery(
                'CALL DeleteStudentSafely(?, ?, @result_message)',
                [studentId, force === 'true']
            );

            const output = await executeQuery('SELECT @result_message as result_message');
            const { result_message } = output[0];

            if (result_message && result_message.startsWith('Error:')) {
                return res.status(400).json({
                    success: false,
                    message: result_message
                });
            }
        } catch (error) {
            // Fallback to manual delete
            console.log('Stored procedure failed, using fallback method:', error.message);

            const student = existingStudent[0];

            // Check for course association if not force delete
            if (student.course_id && force !== 'true') {
                return res.status(400).json({
                    success: false,
                    message: 'Student is enrolled in a course. Use ?force=true to delete anyway.'
                });
            }

            // Delete student (this will cascade to user due to foreign key)
            await executeQuery('DELETE FROM students WHERE student_id = ?', [studentId]);
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get students by course
const getStudentsByCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        // Check if course exists
        const courseExists = await executeQuery('SELECT course_name FROM courses WHERE course_id = ?', [courseId]);
        if (courseExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const studentsQuery = `
            SELECT 
                s.student_id,
                s.student_number,
                u.first_name,
                u.last_name,
                u.email,
                s.enrollment_date,
                s.status,
                s.gpa,
                s.phone
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.course_id = ?
            ORDER BY u.last_name, u.first_name
        `;

        const students = await executeQuery(studentsQuery, [courseId]);

        res.json({
            success: true,
            message: 'Students retrieved successfully',
            data: {
                course: {
                    id: courseId,
                    name: courseExists[0].course_name
                },
                students: students.map(student => ({
                    id: student.student_id,
                    studentNumber: student.student_number,
                    firstName: student.first_name,
                    lastName: student.last_name,
                    email: student.email,
                    enrollmentDate: student.enrollment_date,
                    status: student.status,
                    gpa: student.gpa,
                    phone: student.phone
                }))
            }
        });

    } catch (error) {
        console.error('Get students by course error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentsByCourse
};