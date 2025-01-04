// MuclseMind_BD/src/services/OperatingHoursService.js
const { getOperatingHours, upsertOperatingHours } = require('../models/OperatingHoursModels.js');

const fetchOperatingHours = async (userId) => {
  return await getOperatingHours(userId);
};

const editOperatingHours = async (userId, hoursData) => {
  return await upsertOperatingHours(userId, hoursData);
};

module.exports = { fetchOperatingHours, editOperatingHours };