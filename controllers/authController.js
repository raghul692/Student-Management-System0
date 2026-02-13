const bcrypt = require('bcrypt');
const db = require('../config/db');

// Render login page
exports.getLogin = (req, res) => {
    res.render('login', {
        title: 'Login - Student Management System',
        error: req.flash('error'),
        success: req.flash('success')
    });
};

// Handle login
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ? AND is_active = 1',
            [username]
        );

        if (rows.length === 0) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/auth/login');
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/auth/login');
        }

        // Create session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        };

        req.flash('success', 'Welcome back, ' + user.full_name + '!');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/auth/login');
    }
};

// Handle logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
};

// Setup initial admin user (run once)
exports.setupAdmin = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await db.execute(
            `INSERT INTO users (username, password_hash, email, full_name, role) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
            ['admin', hashedPassword, 'admin@sms.com', 'System Administrator', 'admin']
        );

        req.flash('success', 'Admin user created/updated successfully. Username: admin, Password: admin123');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Setup error:', error);
        req.flash('error', 'An error occurred during setup');
        res.redirect('/auth/login');
    }
};
