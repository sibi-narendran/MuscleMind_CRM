const clinicModel = require('../models/ClinicModels');

// Function to get clinic information
const getClinicInfo = async (userId) => {
  try {
    const info = await clinicModel.getClinicInfo(userId);
    return info;
  } catch (error) {
    console.error('Failed to get clinic info:', error);
    throw error; // Rethrow to handle it further up the call stack
  }
};

// Function to update clinic information
const updateClinicInfo = async (clinicId, clinicData) => {
  try {
    const update = await clinicModel.updateClinicInfo(clinicId, clinicData);
    return update;
  } catch (error) {
    console.error('Failed to update clinic info:', error);
    throw error; // Rethrow to handle it further up the call stack
  }
};

module.exports = {
  getClinicInfo,
  updateClinicInfo
};