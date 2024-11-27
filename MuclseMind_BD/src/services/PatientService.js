const { createPatient, getPatientsByUserId, updatePatient, deletePatient } = require('../models/PatientModels.js');

const addPatient = async (userId, patientData) => {
  return await createPatient({ ...patientData, user_id: userId });
};

const getPatients = async (userId) => {
  return await getPatientsByUserId(userId);
};

const editPatient = async (id, patientData) => {
  return await updatePatient(id, patientData);
};

const removePatient = async (id) => {
  return await deletePatient(id);
};

module.exports = { addPatient, getPatients, editPatient, removePatient }; 