const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// All dashboard routes require authentication
router.use(auth);

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
