const prescriptionService = require('../services/PrescriptionServices');
const { createResponse } = require('../utils/responseUtil');

const getPrescriptions = async (req, res) => {
  const userId = req.user.userId;
  const result = await prescriptionService.fetchPrescriptions(userId);
  if (result.error) {
    res.status(500).json(createResponse(false, 'Failed to fetch prescriptions', null, result.error));
  } else {
    res.status(200).json(createResponse(true, 'Prescriptions fetched successfully', result.data));
  }
};

const createPrescription = async (req, res) => {
  const prescriptionData = req.body;
  const result = await prescriptionService.addPrescription(prescriptionData);
  if (result.error) {
    res.status(500).json(createResponse(false, 'Failed to create prescription', null, result.error));
  } else {
    res.status(201).json(createResponse(true, 'Prescription created successfully', result.data));
  }
};

const updatePrescription = async (req, res) => {
  const { id: prescriptionId } = req.params;
  const prescriptionData = req.body;
  const userId = req.user.userId;
  const result = await prescriptionService.editPrescription(prescriptionId, prescriptionData, userId);
  if (result.error) {
    res.status(500).json(createResponse(false, 'Failed to update prescription', null, result.error));
  } else {
    res.status(200).json(createResponse(true, 'Prescription updated successfully', result.data));
  }
};

const deletePrescription = async (req, res) => {
  const { id: prescriptionId } = req.params;
  const userId = req.user.userId;
  const result = await prescriptionService.removePrescription(prescriptionId, userId);
  if (result.error) {
    res.status(500).json(createResponse(false, 'Failed to delete prescription', null, result.error));
  } else {
    res.status(200).json(createResponse(true, 'Prescription deleted successfully', result.data));
  }
};

module.exports = { getPrescriptions, createPrescription, updatePrescription, deletePrescription };