const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marksController');
const { isAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.use(isAuthenticated);

// Marks management routes
router.get('/', marksController.getAllMarks);
router.get('/add', marksController.getAddMarks);
router.post('/add', marksController.postAddMarks);
router.post('/update/:id', marksController.postUpdateMarks);
router.post('/delete/:id', marksController.deleteMarks);
router.get('/report-card', marksController.getReportCard);

module.exports = router;
