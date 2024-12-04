const DashboardStatsModel = require('../models/DashboardStatsModel');

const getDashboardStats = async (user) => {
  // Pass user details to the model
  const stats = await DashboardStatsModel.getDashboardStats(user);
  return stats;
};

module.exports = { getDashboardStats };