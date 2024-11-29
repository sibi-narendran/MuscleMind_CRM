const { createMedication, getMedicationsByUserId, updateMedication, deleteMedication } = require('../models/MedicationModel');

const addMedication = async (medicationData) => {
  return await createMedication(medicationData);
};

const getMedications = async (userId) => {
  return await getMedicationsByUserId(userId);
};

const editMedication = async (id, medicationData) => {
  return await updateMedication(id, medicationData);
};

const deleteMedicationService = async (id) => {
  return await deleteMedication(id);
};

module.exports = { addMedication, getMedications, editMedication, deleteMedication: deleteMedicationService };
