// Database Setup Script
// Run this script to initialize the database and create the admin user

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function setup() {
    console.log('Student Management System - Database Setup\n');
    console.log('==========================================\n');

    // Database configuration
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        multipleStatements: true
    };

    let connection;

    try {
        // Connect to MySQL server
        console.log('1. Connecting to MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        console.log('   ✓ Connected successfully\n');

        // Create database
        console.log('2. Creating database "sms_db"...');
        await connection.query('CREATE DATABASE IF NOT EXISTS sms_db');
        console.log('   ✓ Database created/verified\n');

        // Switch to the database
        await connection.query('USE sms_db');
        console.log('3. Using database "sms_db"...\n');

        // Read and execute schema
        console.log('4. Creating tables...');
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, 'config', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolons and execute each statement
        const statements = schema.split(';').filter(s => s.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                } catch (err) {
                    if (err.code !== 'ER_DUP_ENTRY') {
                        console.log(`   ⚠ Warning: ${err.message}`);
                    }
                }
            }
        }
        console.log('   ✓ Tables created/verified\n');

        // Create admin user
        console.log('5. Creating admin user...');
        const saltRounds = 10;
        const adminPassword = 'admin123';
        const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

        await connection.query(`
            INSERT INTO users (username, password_hash, email, full_name, role)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
        `, ['admin', passwordHash, 'admin@sms.com', 'System Administrator', 'admin']);
        console.log('   ✓ Admin user created/updated\n');

        // Insert sample subjects
        console.log('6. Inserting sample subjects...');
        const subjects = [
            ['MATH', 'Mathematics', 3],
            ['SCI', 'Science', 3],
            ['ENG', 'English', 3],
            ['SSC', 'Social Science', 3],
            ['HIN', 'Hindi', 3]
        ];

        for (const subject of subjects) {
            await connection.query(`
                INSERT INTO subjects (subject_code, subject_name, credit_hours)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name)
            `, subject);
        }
        console.log('   ✓ Sample subjects added\n');

        console.log('==========================================');
        console.log('Setup completed successfully!\n');
        console.log('Admin Login Credentials:');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('\nNext steps:');
        console.log('  1. Run: npm start');
        console.log('  2. Open: http://localhost:3000');
        console.log('  3. Login with admin/admin123');
        console.log('==========================================\n');

    } catch (error) {
        console.error('Setup failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('  1. Make sure MySQL is running');
        console.log('  2. Check database credentials in .env file');
        console.log('  3. Create .env file from .env.example\n');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run setup
setup();
