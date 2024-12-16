const PatientService = require('../services/PatientService');
const { createResponse } = require('../utils/responseUtil');

const addPatientController = async (req, res) => {
  try {
    const patientData = req.body;
    const files = req.files;
    const result = await PatientService.addPatient(patientData, files);
    res.status(201).json(createResponse(true, 'Patient added successfully', result));
  } catch (error) {
    console.error('Add patient error:', error);
    res.status(500).json(createResponse(false, 'Failed to add patient', null, error.message));
  }
};

const getPatientsController = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const patients = await PatientService.getPatients(userId);
    res.status(200).json(createResponse(true, 'Patients retrieved successfully', patients));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to retrieve patients', null, error.message));
  }
};

const editPatientController = async (req, res) => {
  try {
    const { id } = req.params;
    const patientData = req.body;
    const files = req.files;
    console.log(files); 
    const result = await PatientService.updatePatient(id, patientData, files);
    res.status(200).json(createResponse(true, 'Patient updated successfully', result));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to update patient', null, error.message));
  }
};

const deletePatientController = async (req, res) => {
  try {
    const { id } = req.params;
    await PatientService.deletePatient(id);
    res.status(200).json(createResponse(true, 'Patient deleted successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to delete patient', null, error.message));
  }
};

module.exports = {
  addPatientController,
  getPatientsController,
  editPatientController,
  deletePatientController
}; 