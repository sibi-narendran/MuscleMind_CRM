const prescriptionModel = require('../models/prescriptionModel');

const fetchPrescriptions = async (userId) => {
  return await prescriptionModel.getPrescriptions(userId);
};

const addPrescription = async (prescriptionData) => {
  return await prescriptionModel.createPrescription(prescriptionData);
};

const editPrescription = async (id, prescriptionData, userId) => {
  return await prescriptionModel.updatePrescription(id, prescriptionData, userId);
};

const removePrescription = async (id, userId) => {
  return await prescriptionModel.deletePrescription(id, userId);
};

module.exports = { fetchPrescriptions, addPrescription, editPrescription, removePrescription };