const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedData() {
    try {
        // Create connection to the database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: 'student_course_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to student_course_db database');

        // Hash password for sample users
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Insert sample courses
        await connection.execute(`
            INSERT INTO courses (course_name, course_code, course_duration, course_description, max_students) VALUES
            ('Computer Science Fundamentals', 'CS101', 16, 'Introduction to programming, algorithms, and data structures', 30),
            ('Web Development Bootcamp', 'WEB201', 12, 'Full-stack web development with modern frameworks', 25),
            ('Data Science and Analytics', 'DS301', 20, 'Data analysis, machine learning, and statistical modeling', 20),
            ('Mobile App Development', 'MOB401', 14, 'iOS and Android application development', 20),
            ('Cybersecurity Essentials', 'CYB501', 18, 'Network security, ethical hacking, and risk management', 15)
        `);
        console.log('✅ Inserted sample courses');

        // Insert admin user
        await connection.execute(`
            INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
            ('admin@university.com', ?, 'admin', 'System', 'Administrator')
        `, [hashedPassword]);
        console.log('✅ Inserted admin user (admin@university.com / password123)');

        // Insert sample students
        await connection.execute(`
            INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
            ('john.doe@email.com', ?, 'student', 'John', 'Doe'),
            ('jane.smith@email.com', ?, 'student', 'Jane', 'Smith'),
            ('mike.johnson@email.com', ?, 'student', 'Mike', 'Johnson'),
            ('sarah.williams@email.com', ?, 'student', 'Sarah', 'Williams'),
            ('david.brown@email.com', ?, 'student', 'David', 'Brown')
        `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword]);
        console.log('✅ Inserted sample student users');

        // Insert sample students with course associations
        await connection.execute(`
            INSERT INTO students (user_id, student_number, course_id, enrollment_date, phone, address, gpa) VALUES
            (2, 'STU001', 1, '2024-01-15', '+1-555-0101', '123 Main St, City, State', 3.85),
            (3, 'STU002', 2, '2024-02-01', '+1-555-0102', '456 Oak Ave, City, State', 3.92),
            (4, 'STU003', 1, '2024-01-20', '+1-555-0103', '789 Pine Rd, City, State', 3.67),
            (5, 'STU004', 3, '2024-03-01', '+1-555-0104', '321 Elm St, City, State', 4.00),
            (6, 'STU005', 2, '2024-02-15', '+1-555-0105', '654 Maple Dr, City, State', 3.78)
        `);
        console.log('✅ Inserted sample student records');

        await connection.end();
        console.log('🎉 Sample data seeded successfully!');
        
        console.log('\n📝 Login Credentials:');
        console.log('Admin: admin@university.com / password123');
        console.log('Student: john.doe@email.com / password123');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
}

seedData();