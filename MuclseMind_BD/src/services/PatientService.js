const PatientModel = require('../models/PatientModels');
const { uploadFiles } = require('../utils/storageServices');

const addPatient = async (patientData, files) => {
  try {
    const uploadedFiles = await uploadFiles(files);
    const newPatient = {
      ...patientData,
      documents: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      created_at: new Date()
    };
    return await PatientModel.createPatient(newPatient);
  } catch (error) {
    throw error;
  }
};

const getPatients = async (userId) => {
  try {
    return await PatientModel.getPatientsByUserId(userId);
  } catch (error) {
    throw error;
  }
};

const updatePatient = async (id, patientData, files) => {
  try {
    const uploadedFiles = await uploadFiles(files);
    const updatedData = {
      ...patientData,
      documents: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      updated_at: new Date()
    };
    return await PatientModel.updatePatient(id, updatedData);
  } catch (error) {
    throw error;
  }
};

const deletePatient = async (id) => {
  try {
    return await PatientModel.deletePatient(id);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addPatient,
  getPatients,
  updatePatient,
  deletePatient
}; 