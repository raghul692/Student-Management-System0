const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { isAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.use(isAuthenticated);

// Student management routes
router.get('/', studentController.getAllStudents);
router.get('/add', studentController.getAddStudent);
router.post('/add', studentController.postAddStudent);
router.get('/edit/:id', studentController.getEditStudent);
router.post('/edit/:id', studentController.postEditStudent);
router.get('/details/:id', studentController.getStudentDetails);
router.post('/delete/:id', studentController.deleteStudent);

module.exports = router;
