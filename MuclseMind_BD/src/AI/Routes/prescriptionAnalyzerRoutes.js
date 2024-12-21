const express = require('express');
const router = express.Router();
const { authenticateJWTUserID } = require('../../middleware/authMiddleware');
const { generatePrescription } = require('../controller/prescriptionAnalyzerController');

// Generate prescription using AI
router.post('/prescription/:id', authenticateJWTUserID, generatePrescription);

module.exports = router;
