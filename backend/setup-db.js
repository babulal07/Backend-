const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
    try {
        // Connect to MySQL server without specifying a database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to MySQL server');

        // Create database
        await connection.execute('CREATE DATABASE IF NOT EXISTS student_course_db');
        console.log('✅ Database created/verified: student_course_db');

        // Close the initial connection
        await connection.end();

        // Create new connection with database specified
        const dbConnection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: 'student_course_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to student_course_db database');

        // Drop tables if they exist (for clean setup)
        await dbConnection.execute('DROP TABLE IF EXISTS students');
        await dbConnection.execute('DROP TABLE IF EXISTS courses');
        await dbConnection.execute('DROP TABLE IF EXISTS users');
        console.log('✅ Dropped existing tables');

        // Create Users table
        await dbConnection.execute(`
            CREATE TABLE users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin', 'student') DEFAULT 'student',
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created users table');

        // Create Course Table
        await dbConnection.execute(`
            CREATE TABLE courses (
                course_id INT AUTO_INCREMENT PRIMARY KEY,
                course_name VARCHAR(100) NOT NULL,
                course_code VARCHAR(20) UNIQUE NOT NULL,
                course_duration INT NOT NULL COMMENT 'Duration in weeks',
                course_description TEXT,
                max_students INT DEFAULT 50,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_course_code (course_code),
                INDEX idx_course_name (course_name)
            )
        `);
        console.log('✅ Created courses table');

        // Create Student Table
        await dbConnection.execute(`
            CREATE TABLE students (
                student_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE,
                student_number VARCHAR(20) UNIQUE NOT NULL,
                course_id INT,
                enrollment_date DATE NOT NULL,
                status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
                gpa DECIMAL(3,2) DEFAULT 0.00,
                phone VARCHAR(20),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL,
                
                INDEX idx_student_number (student_number),
                INDEX idx_course_id (course_id),
                INDEX idx_user_id (user_id)
            )
        `);
        console.log('✅ Created students table');

        await dbConnection.end();
        console.log('🎉 Database schema created successfully!');

    } catch (error) {
        console.error('❌ Error creating database:', error);
    }
}

createDatabase();