const { createTreatment, getTreatmentsByUserId, updateTreatment, deleteTreatment } = require('../models/TreatmentModel');

const convertDurationToMinutes = (duration) => {
  if (typeof duration !== 'string') {
    throw new Error('Duration must be a string');
  }

  let totalMinutes = 0;

  // Check if the duration contains hours
  const hourMatch = duration.match(/(\d+(\.\d+)?)\s*hr/);
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60;
  }

  // Check if the duration contains minutes
  const minuteMatch = duration.match(/(\d+)\s*mins/);
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }

  return totalMinutes;
};

const addTreatment = async (treatmentData) => {
  treatmentData.duration = convertDurationToMinutes(treatmentData.duration);
  return await createTreatment(treatmentData);
};

const getTreatments = async (userId) => {
  return await getTreatmentsByUserId(userId);
};

const editTreatment = async (id, treatmentData) => {
  treatmentData.duration = convertDurationToMinutes(treatmentData.duration);
  return await updateTreatment(id, treatmentData);
};

const deleteTreatmentService = async (id) => {
  return await deleteTreatment(id);
};

module.exports = { addTreatment, getTreatments, editTreatment, deleteTreatment: deleteTreatmentService };
