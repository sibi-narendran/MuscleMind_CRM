const express = require('express');
const DashboardStatsController = require('../../controller/DashboardStatsController');
const { authenticateJWT } = require('../../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard-stats', authenticateJWT, DashboardStatsController.getDashboardStats);
router.get('/dashboard-patient-growth', authenticateJWT, DashboardStatsController.getDashboardData);

module.exports = router;