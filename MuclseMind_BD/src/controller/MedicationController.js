const { addMedication, getMedications, editMedication, deleteMedication } = require('../services/MedicationService');
const { createResponse } = require('../utils/responseUtil');

const addMedicationController = async (req, res) => {
  const { id: userId } = req.user;
  const medicationData = { ...req.body, user_id: userId };
  try {
    const newMedication = await addMedication(medicationData);
    res.status(201).json(createResponse(true, 'Medication added successfully', newMedication));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to add medication', null, error.message));
  }
};

const getMedicationsController = async (req, res) => {
  const { id: userId } = req.user;
  try {
    const medications = await getMedications(userId);
    res.status(200).json(createResponse(true, 'Medications retrieved successfully', medications));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to retrieve medications', null, error.message));
  }
};

const editMedicationController = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedMedication = await editMedication(id, req.body);
    res.status(200).json(createResponse(true, 'Medication updated successfully', updatedMedication));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to update medication', null, error.message));
  }
};

const deleteMedicationController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteMedication(id);
    res.status(200).json(createResponse(true, 'Medication deleted successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to delete medication', null, error.message));
  }
};

module.exports = { addMedicationController, getMedicationsController, editMedicationController, deleteMedicationController };
