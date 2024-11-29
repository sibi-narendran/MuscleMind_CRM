const { createAppointment, getAppointments, getAppointmentsByDate, updateAppointment, deleteAppointment } = require('../models/AppointmentModel');
const { getOperatingHoursByDay } = require('../models/OperatingHoursModel');
const { getTreatmentById } = require('../models/TreatmentModel');

const addAppointment = async (appointmentData) => {
  const { date, time, treatmentId } = appointmentData;
  const appointmentTime = new Date(`${date} ${time}`);
  const day = appointmentTime.toLocaleString('en-US', { weekday: 'long' });

  // Check operating hours
  const operatingHours = await getOperatingHoursByDay(day);
  if (!operatingHours || appointmentTime.getHours() < operatingHours.open_time || appointmentTime.getHours() >= operatingHours.close_time) {
    throw new Error('Appointment time is outside of operating hours');
  }

  // Check treatment duration
  const treatment = await getTreatmentById(treatmentId);
  const duration = treatment.duration; // Assume duration is in minutes
  const endTime = new Date(appointmentTime.getTime() + duration * 60000);

  // Check for overlapping appointments
  const appointments = await getAppointmentsByDate(date);
  for (const apt of appointments) {
    const aptStartTime = new Date(`${apt.date} ${apt.time}`);
    const aptEndTime = new Date(aptStartTime.getTime() + apt.duration * 60000);
    if ((appointmentTime >= aptStartTime && appointmentTime < aptEndTime) || (endTime > aptStartTime && endTime <= aptEndTime)) {
      throw new Error('Appointment time overlaps with another appointment');
    }
  }

  return await createAppointment({ ...appointmentData, duration });
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