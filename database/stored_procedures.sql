-- Stored Procedures for Student and Course Management System
USE student_course_db;

-- Change delimiter for stored procedures
DELIMITER //

-- 1. Stored Procedure: Insert new student with course assignment
CREATE PROCEDURE InsertStudentWithCourse(
    IN p_email VARCHAR(100),
    IN p_password_hash VARCHAR(255),
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_student_number VARCHAR(20),
    IN p_course_id INT,
    IN p_phone VARCHAR(20),
    IN p_address TEXT,
    OUT p_student_id INT,
    OUT p_result_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_course_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_message = 'Error: Transaction failed';
        SET p_student_id = 0;
    END;

    START TRANSACTION;

    -- Check if course exists
    IF p_course_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_course_exists FROM courses WHERE course_id = p_course_id;
        IF v_course_exists = 0 THEN
            SET p_result_message = 'Error: Course does not exist';
            SET p_student_id = 0;
            ROLLBACK;
            LEAVE;
        END IF;
    END IF;

    -- Insert user
    INSERT INTO users (email, password_hash, role, first_name, last_name)
    VALUES (p_email, p_password_hash, 'student', p_first_name, p_last_name);
    
    SET v_user_id = LAST_INSERT_ID();

    -- Insert student
    INSERT INTO students (user_id, student_number, course_id, enrollment_date, phone, address)
    VALUES (v_user_id, p_student_number, p_course_id, CURDATE(), p_phone, p_address);
    
    SET p_student_id = LAST_INSERT_ID();

    COMMIT;
    SET p_result_message = 'Student created successfully';
END //

-- 2. Stored Procedure: Update student details with course modification
CREATE PROCEDURE UpdateStudentWithCourse(
    IN p_student_id INT,
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_course_id INT,
    IN p_phone VARCHAR(20),
    IN p_address TEXT,
    IN p_status VARCHAR(20),
    OUT p_result_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_course_exists INT DEFAULT 0;
    DECLARE v_student_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_message = 'Error: Update failed';
    END;

    START TRANSACTION;

    -- Check if student exists
    SELECT COUNT(*), user_id INTO v_student_exists, v_user_id 
    FROM students WHERE student_id = p_student_id;
    
    IF v_student_exists = 0 THEN
        SET p_result_message = 'Error: Student does not exist';
        ROLLBACK;
        LEAVE;
    END IF;

    -- Check if course exists (if course_id is provided)
    IF p_course_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_course_exists FROM courses WHERE course_id = p_course_id;
        IF v_course_exists = 0 THEN
            SET p_result_message = 'Error: Course does not exist';
            ROLLBACK;
            LEAVE;
        END IF;
    END IF;

    -- Update user information
    UPDATE users 
    SET first_name = p_first_name, last_name = p_last_name
    WHERE user_id = v_user_id;

    -- Update student information
    UPDATE students 
    SET course_id = p_course_id, phone = p_phone, address = p_address, status = p_status
    WHERE student_id = p_student_id;

    COMMIT;
    SET p_result_message = 'Student updated successfully';
END //

-- 3. Stored Procedure: Delete student with course relationship handling
CREATE PROCEDURE DeleteStudentSafely(
    IN p_student_id INT,
    IN p_force_delete BOOLEAN DEFAULT FALSE,
    OUT p_result_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_course_id INT;
    DECLARE v_student_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_message = 'Error: Delete operation failed';
    END;

    START TRANSACTION;

    -- Check if student exists
    SELECT COUNT(*), user_id, course_id INTO v_student_exists, v_user_id, v_course_id
    FROM students WHERE student_id = p_student_id;
    
    IF v_student_exists = 0 THEN
        SET p_result_message = 'Error: Student does not exist';
        ROLLBACK;
        LEAVE;
    END IF;

    -- Check if student is associated with a course
    IF v_course_id IS NOT NULL AND p_force_delete = FALSE THEN
        SET p_result_message = 'Error: Student is enrolled in a course. Use force delete or unenroll first';
        ROLLBACK;
        LEAVE;
    END IF;

    -- Delete student (this will also delete the user due to CASCADE)
    DELETE FROM students WHERE student_id = p_student_id;

    COMMIT;
    SET p_result_message = 'Student deleted successfully';
END //

-- 4. Stored Procedure: Get student details with course information
CREATE PROCEDURE GetStudentWithCourseDetails(
    IN p_student_id INT
)
BEGIN
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
        c.course_description
    FROM students s
    JOIN users u ON s.user_id = u.user_id
    LEFT JOIN courses c ON s.course_id = c.course_id
    WHERE s.student_id = p_student_id;
END //

-- 5. Stored Procedure: Get all students in a specific course
CREATE PROCEDURE GetStudentsInCourse(
    IN p_course_id INT
)
BEGIN
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
    WHERE s.course_id = p_course_id
    ORDER BY u.last_name, u.first_name;
END //

-- Reset delimiter
DELIMITER ;