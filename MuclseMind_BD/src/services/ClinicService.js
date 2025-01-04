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

const updateClinicImageUrls = async (userId, imageData) => {
  try {
    const result = await clinicModel.updateClinicImages(userId, imageData);
    if (result.error) throw new Error(result.error);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in updateClinicImageUrls service:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  getClinicInfo,
  updateClinicInfo,
  updateClinicImageUrls
};