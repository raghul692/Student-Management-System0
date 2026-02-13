const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const path = require('path');

// Load environment variables
dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || '1aef99068c3c700e5c43042a39b958a60288dde901df01477e4ed0eb1f5fa8f1975eebad98b984a78cbb87d2bd646065c2f594094799d0e02d249872f58b8d57',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages
app.use(flash());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global variables for templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    res.locals.currentPath = req.path;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const marksRoutes = require('./routes/marks');

app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/marks', marksRoutes);

// Dashboard route
app.get('/dashboard', require('./controllers/marksController').getDashboardStats);

// Index route - redirect to dashboard or login
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Page Not Found',
        user: req.session.user || null
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('500', {
        title: 'Server Error',
        error: err.message,
        user: req.session.user || null
    });
});

module.exports = app;
