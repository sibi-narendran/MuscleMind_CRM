const { getDashboardStatsModel, getPatientGrowth } = require('../models/DashboardStatsModel');
const { createResponse } = require('../utils/responseUtil');

const getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStatsModel(req.user);
    res.status(200).json(createResponse(true, 'Stats fetched successfully', stats));
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json(createResponse(false, 'Failed to fetch stats', null, error.message));
  }
};

const getDashboardData = async (req, res) => {
  if (!req.user) {
    return res.status(401).json(createResponse(false, "User not authenticated"));
  }

  try {
    const stats = await getDashboardStatsModel(req.user);
    const patientGrowth = await getPatientGrowth(req.user.id);

    res.status(200).json(createResponse(true, 'Dashboard data fetched successfully', {
      stats,
      patientGrowth
    }));
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json(createResponse(false, 'Failed to fetch dashboard data', null, error.message));
  }
};

module.exports = { getDashboardStats, getDashboardData }; 
