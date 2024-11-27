const { addPatient, getPatients, editPatient, removePatient } = require('../services/PatientService.js');
const { createResponse } = require('../utils/responseUtil.js');

const addPatientController = async (req, res) => {
  const { id: userId } = req.user; // Assuming user ID is in the JWT payload
  const patientData = req.body;
  try {
    const newPatient = await addPatient(userId, patientData);
    res.status(201).json(createResponse(true, 'Patient added successfully', newPatient));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to add patient', null, error.message));
  }
};

const getPatientsController = async (req, res) => {
  const { id: userId } = req.user;
  try {
    const patients = await getPatients(userId);
    res.status(200).json(createResponse(true, 'Patients retrieved successfully', patients));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to retrieve patients', null, error.message));
  }
};

const editPatientController = async (req, res) => {
  const { id } = req.params;
  const patientData = req.body;
  try {
    const updatedPatient = await editPatient(id, patientData);
    res.status(200).json(createResponse(true, 'Patient updated successfully', updatedPatient));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to update patient', null, error.message));
  }
};

const deletePatientController = async (req, res) => {
  const { id } = req.params;
  try {
    await removePatient(id);
    res.status(200).json(createResponse(true, 'Patient deleted successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to delete patient', null, error.message));
  }
};

module.exports = { addPatientController, getPatientsController, editPatientController, deletePatientController }; 