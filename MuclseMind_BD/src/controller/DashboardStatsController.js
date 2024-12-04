const { getPatientGrowth } = require('../models/DashboardStatsModel');
const DashboardStatsService = require('../services/DashboardStatsService');
const { createResponse } = require('../utils/responseUtil');

const getDashboardStats = async (req, res) => {
  try {
    const stats = await DashboardStatsService.getDashboardStats(req.user);
    res.status(200).json(createResponse(true, 'Stats fetched successfully', stats));
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json(createResponse(false, 'Failed to fetch stats', null, error.message));
  }
};

const getDashboardData = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  try {
    const stats = await getDashboardStats(req.user);
    const patientGrowth = await getPatientGrowth();

    res.json({
      success: true,
      data: {
        stats,
        patientGrowth
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats,getDashboardData }; 