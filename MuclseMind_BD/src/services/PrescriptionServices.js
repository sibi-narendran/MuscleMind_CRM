const prescriptionModel = require('../models/prescriptionModel');

const fetchPrescriptions = async (userId) => {
  return await prescriptionModel.getPrescriptions(userId);
};

const addPrescription = async (prescriptionData, userId) => {
  const dataWithUserId = {
    ...prescriptionData,
    user_id: userId
  };
  return await prescriptionModel.createPrescription(dataWithUserId);
};

const editPrescription = async (id, prescriptionData, userId) => {
  const dataWithUserId = {
    ...prescriptionData,
    user_id: userId
  };
  return await prescriptionModel.updatePrescription(id, dataWithUserId, userId);
};

const removePrescription = async (id, userId) => {
  return await prescriptionModel.deletePrescription(id, userId);
};

module.exports = { fetchPrescriptions, addPrescription, editPrescription, removePrescription };