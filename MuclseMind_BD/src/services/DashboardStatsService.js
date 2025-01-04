const {
  getDashboardStatsModel,
  getPatientGrowthModel,
  getTodayAppointmentsModel
} = require("../models/DashboardStatsModel");

const getDashboardStats = async (userId) => {
  return await getDashboardStatsModel(userId);
};

const getPatientGrowth = async (userId) => {
  return await getPatientGrowthModel(userId);
};

const getTodayAppointments = async (userId) => {
  return await getTodayAppointmentsModel(userId);
};

module.exports = {
  getDashboardStats,
  getPatientGrowth,
  getTodayAppointments
};