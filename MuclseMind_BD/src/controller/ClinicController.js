const clinicService = require('../services/ClinicService');
const { createResponse } = require('../utils/responseUtil');

// Function to handle getting clinic information
const getClinicInfo = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached to req.user by auth middleware
    const data = await clinicService.getClinicInfo(userId);
    createResponse(res, 200, data);
  } catch (error) {
    createResponse(res, 500, { message: error.message });
  }
};

// Function to handle updating clinic information
const updateClinicInfo = async (req, res) => {
  try {
    const clinicId = req.params.id; // Assuming clinic ID is passed as URL parameter
    const clinicData = req.body;
    const data = await clinicService.updateClinicInfo(clinicId, clinicData);
    createResponse(res, 200, data);
  } catch (error) {
    createResponse(res, 500, { message: error.message });
  }
};

module.exports = {
  getClinicInfo,
  updateClinicInfo
};