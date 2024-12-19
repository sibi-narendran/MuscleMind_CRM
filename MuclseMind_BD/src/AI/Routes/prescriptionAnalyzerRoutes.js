const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { generatePrescription } = require('../controllers/prescriptionAnalyzerController');

// Generate prescription using AI
router.put('/prescription/:appointmentId', authenticateToken, generatePrescription);

module.exports = router;
