const { createClinic, getClinics, updateClinic, deleteClinic } = require('../models/ClinicModels.js');

const addClinic = async (userId, clinicData) => {
  const dataWithUserId = { ...clinicData, user_id: userId };
  return await createClinic(dataWithUserId);
};

const fetchClinics = async (userId) => {
  return await getClinics(userId);
};

const editClinic = async (id, clinicData) => {
  return await updateClinic(id, clinicData);
};

const removeClinic = async (id) => {
  return await deleteClinic(id);
};

module.exports = { addClinic, fetchClinics, editClinic, removeClinic };
