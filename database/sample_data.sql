-- Sample Data for Student and Course Management System
USE student_course_db;

-- Insert sample courses
INSERT INTO courses (course_name, course_code, course_duration, course_description, max_students) VALUES
('Computer Science Fundamentals', 'CS101', 16, 'Introduction to programming, algorithms, and data structures', 30),
('Web Development Bootcamp', 'WEB201', 12, 'Full-stack web development with modern frameworks', 25),
('Data Science and Analytics', 'DS301', 20, 'Data analysis, machine learning, and statistical modeling', 20),
('Mobile App Development', 'MOB401', 14, 'iOS and Android application development', 20),
('Cybersecurity Essentials', 'CYB501', 18, 'Network security, ethical hacking, and risk management', 15);

-- Insert admin user
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
('admin@university.com', '$2b$10$rI7Qx5FwK8jl3nN2K8MZHuE8/zKl5fW9rS2dV6tQ7uP3lM4oC9xGe', 'admin', 'System', 'Administrator');

-- Insert sample students (using hashed password: 'password123')
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
('john.doe@email.com', '$2b$10$rI7Qx5FwK8jl3nN2K8MZHuE8/zKl5fW9rS2dV6tQ7uP3lM4oC9xGe', 'student', 'John', 'Doe'),
('jane.smith@email.com', '$2b$10$rI7Qx5FwK8jl3nN2K8MZHuE8/zKl5fW9rS2dV6tQ7uP3lM4oC9xGe', 'student', 'Jane', 'Smith'),
('mike.johnson@email.com', '$2b$10$rI7Qx5FwK8jl3nN2K8MZHuE8/zKl5fW9rS2dV6tQ7uP3lM4oC9xGe', 'student', 'Mike', 'Johnson'),
('sarah.williams@email.com', '$2b$10$rI7Qx5FwK8jl3nN2K8MZHuE8/zKl5fW9rS2dV6tQ7uP3lM4oC9xGe', 'student', 'Sarah', 'Williams'),
('david.brown@email.com', '$2b$10$rI7Qx5FwK8jl3nN2K8MZHuE8/zKl5fW9rS2dV6tQ7uP3lM4oC9xGe', 'student', 'David', 'Brown');

-- Insert sample students with course associations
INSERT INTO students (user_id, student_number, course_id, enrollment_date, phone, address, gpa) VALUES
(2, 'STU001', 1, '2024-01-15', '+1-555-0101', '123 Main St, City, State', 3.85),
(3, 'STU002', 2, '2024-02-01', '+1-555-0102', '456 Oak Ave, City, State', 3.92),
(4, 'STU003', 1, '2024-01-20', '+1-555-0103', '789 Pine Rd, City, State', 3.67),
(5, 'STU004', 3, '2024-03-01', '+1-555-0104', '321 Elm St, City, State', 4.00),
(6, 'STU005', 2, '2024-02-15', '+1-555-0105', '654 Maple Dr, City, State', 3.78);

-- Test stored procedures with sample calls
-- Note: These are example calls - uncomment to test

-- CALL InsertStudentWithCourse(
--     'test.student@email.com',
--     '$2b$10$rI7Qx5FwK8jl3nN2K8MZHuE8/zKl5fW9rS2dV6tQ7uP3lM4oC9xGe',
--     'Test',
--     'Student',
--     'STU006',
--     1,
--     '+1-555-0106',
--     '999 Test Ave, City, State',
--     @student_id,
--     @result_msg
-- );

-- SELECT @student_id as student_id, @result_msg as result_message;