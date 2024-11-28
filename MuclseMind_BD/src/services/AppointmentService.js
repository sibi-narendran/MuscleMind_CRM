const { createAppointment, getAppointments, updateAppointment, deleteAppointment } = require('../models/AppointmentModels.js');

const addAppointment = async (appointmentData) => {
  // Check if the appointment time is within allowed hours (9 AM to 6 PM)
  const appointmentTime = new Date(appointmentData.date + ' ' + appointmentData.time);
  const startHour = 9;
  const endHour = 18;

  if (appointmentTime.getHours() < startHour || appointmentTime.getHours() >= endHour) {
    throw new Error('Appointment time must be between 9 AM and 6 PM');
  }

  return await createAppointment(appointmentData);
};

const fetchAppointments = async () => {
  return await getAppointments();
};

const modifyAppointment = async (id, updatedData) => {
  return await updateAppointment(id, updatedData);
};

const removeAppointment = async (id) => {
  return await deleteAppointment(id);
};

module.exports = { addAppointment, fetchAppointments, modifyAppointment, removeAppointment };