const clinicService = require('../services/ClinicService');
const { createResponse } = require('../utils/responseUtil');

// Function to handle getting clinic information
const getClinicInfo = async (req, res) => {
  try {
    const userId = req.user.id; 
    const data = await clinicService.getClinicInfo(userId);
    res.status(200).json(createResponse(true, 'Clinic info fetched successfully', data));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to fetch clinic info', null, error.message));
  }
};

// Function to handle updating clinic information
const updateClinicInfo = async (req, res) => {
  try {
    const clinicId = req.params.id; // Assuming clinic ID is passed as URL parameter
    const clinicData = req.body;
    const data = await clinicService.updateClinicInfo(clinicId, clinicData);
    res.status(200).json(createResponse(true, 'Clinic info updated successfully', data));
      } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to update clinic info', null, error.message));
  }
};

module.exports = {
  getClinicInfo,
  updateClinicInfo
};