const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { 
  getTodayAppointmentsController,
  getAppointmentsByDateRangeController
} = require('../controller/AppointmentController');

// Add new routes with auth middleware
router.get('/today', authenticateToken, getTodayAppointmentsController);
router.get('/date-range', authenticateToken, getAppointmentsByDateRangeController);

module.exports = router;