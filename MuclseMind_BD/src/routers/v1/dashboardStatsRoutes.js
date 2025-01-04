const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../../middleware/authMiddleware");
const {
  getDashboardStats,
  getPatientGrowth,
  getTodayAppointments
} = require("../../controller/DashboardStatsController");

router.get("/dashboard-stats", authenticateJWT, getDashboardStats);
router.get("/dashboard-patient-growth", authenticateJWT, getPatientGrowth);
router.get("/today-appointments", authenticateJWT, getTodayAppointments);

module.exports = router;