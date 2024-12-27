const {
  getDashboardStatsModel,
  getPatientGrowthModel,
  getTodayAppointmentsModel
} = require("../models/DashboardStatsModel");
const { createResponse } = require("../utils/responseUtil");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getDashboardStatsModel(userId);
    if (result.success) {
      return res.json(createResponse(true, "Dashboard stats fetched successfully", result.data));
    }
    return res.status(400).json(createResponse(false, "Failed to fetch dashboard stats", null, result.error));
  } catch (error) {
    console.error("Dashboard Stats Controller Error:", error);
    return res.status(500).json(createResponse(false, "Error in dashboard stats controller", null, error.message));
  }
};

const getPatientGrowth = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getPatientGrowthModel(userId);
    if (result.success) {
      return res.json(createResponse(true, "Patient growth data fetched successfully", result.data));
    }
    return res.status(400).json(createResponse(false, "Failed to fetch patient growth data", null, result.error));
  } catch (error) {
    console.error("Patient Growth Controller Error:", error);
    return res.status(500).json(createResponse(false, "Error in patient growth controller", null, error.message));
  }
};

const getTodayAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getTodayAppointmentsModel(userId);
    if (result.success) {
      return res.json(createResponse(true, "Today's appointments fetched successfully", result.data));
    }
    return res.status(400).json(createResponse(false, "Failed to fetch today's appointments", null, result.error));
  } catch (error) {
    console.error("Today's Appointments Controller Error:", error);
    return res.status(500).json(createResponse(false, "Error in today's appointments controller", null, error.message));
  }
};

module.exports = {
  getDashboardStats,
  getPatientGrowth,
  getTodayAppointments
};