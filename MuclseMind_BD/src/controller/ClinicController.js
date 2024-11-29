const { addClinic, fetchClinics, editClinic, removeClinic } = require('../services/ClinicService.js');
const { createResponse } = require('../utils/responseUtil.js');

const addClinicController = async (req, res) => {
  const { id: userId } = req.user; // Assuming user ID is in the JWT payload
  const clinicData = req.body;
  try {
    const newClinic = await addClinic(userId, clinicData);
    res.status(201).json(createResponse(true, 'Clinic added successfully', newClinic));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to add clinic', null, error.message));
  }
};

const getClinicsController = async (req, res) => {
  const { id: userId } = req.user;
  try {
    const clinics = await fetchClinics(userId);
    res.status(200).json(createResponse(true, 'Clinics retrieved successfully', clinics));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to retrieve clinics', null, error.message));
  }
};

const editClinicController = async (req, res) => {
  const { id } = req.params;
  const clinicData = req.body;
  try {
    const updatedClinic = await editClinic(id, clinicData);
    res.status(200).json(createResponse(true, 'Clinic updated successfully', updatedClinic));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to update clinic', null, error.message));
  }
};

const deleteClinicController = async (req, res) => {
  const { id } = req.params;
  try {
    await removeClinic(id);
    res.status(200).json(createResponse(true, 'Clinic deleted successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to delete clinic', null, error.message));
  }
};

module.exports = { addClinicController, getClinicsController, editClinicController, deleteClinicController };
