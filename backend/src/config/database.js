const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'student_course_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Execute query helper function
const executeQuery = async (query, params = []) => {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Execute stored procedure helper
const callStoredProcedure = async (procedureName, params = []) => {
    try {
        const placeholders = params.map(() => '?').join(',');
        const query = `CALL ${procedureName}(${placeholders})`;
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Stored procedure error:', error);
        throw error;
    }
};

module.exports = {
    pool,
    testConnection,
    executeQuery,
    callStoredProcedure
};