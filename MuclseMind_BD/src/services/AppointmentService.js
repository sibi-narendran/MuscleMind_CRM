const { createAppointment, getAppointments, getAppointmentsByDate, updateAppointment, deleteAppointment } = require('../models/AppointmentModels');
const { getOperatingHoursByDay } = require('../models/OperatingHoursModels');
const { getTreatmentById } = require('../models/TreatmentModel');
const { findAllHolidays } = require('../models/holidayModel');

const addAppointment = async (appointmentData, doctorId) => {
  const { date, time, treatment_id, treatment_name, patient_id, patient_name } = appointmentData;
  const appointmentTime = new Date(`${date}T${time}:00`);
  const day = appointmentTime.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();


  // Check operating hours
  const operatingHoursList = await getOperatingHoursByDay(day);
  if (!operatingHoursList || operatingHoursList.length === 0) {
    throw new Error('Operating hours not found for this day');
  }

  const operatingHours = operatingHoursList[0];
  if (operatingHours.status !== 'open') {
    throw new Error('Clinic is closed on this day');
  }

  const openTime = new Date(`${date}T${operatingHours.open_time}`);
  const closeTime = new Date(`${date}T${operatingHours.close_time}`);
  if (appointmentTime < openTime || appointmentTime >= closeTime) {
    throw new Error('Appointment time is outside of operating hours');
  }

  // Check treatment duration
  const treatmentDetails = await getTreatmentById(treatment_id);
  const duration = Array.isArray(treatmentDetails) && treatmentDetails.length > 0 ? treatmentDetails[0].duration : undefined;

  if (duration === undefined) {
    throw new Error('Duration not found for the treatment');
  }

  const endTime = new Date(appointmentTime.getTime() + duration * 60000);
  console.log("Appointment End Time:", endTime);

  // Check for overlapping appointments for the same doctor
  const appointments = await getAppointmentsByDate(date);
  console.log("Existing Appointments on Date:", date, appointments);

  for (const apt of appointments) {
    if (apt.doctor_id === doctorId) { // Check only for the same doctor
      const aptStartTime = new Date(`${apt.date}T${apt.time}`);
      const aptEndTime = new Date(aptStartTime.getTime() + apt.duration * 60000);
      console.log("Checking against Appointment ID:", apt.id);
      console.log("Existing Appointment Start Time:", aptStartTime);
      console.log("Existing Appointment End Time:", aptEndTime);

      if ((appointmentTime >= aptStartTime && appointmentTime < aptEndTime) || (endTime > aptStartTime && endTime <= aptEndTime)) {
        console.error('Overlap Detected with Appointment ID:', apt.id);
        throw new Error('Appointment time overlaps with another appointment for the same doctor');
      }
    }
  }

  // Fetch holidays
  const holidays = await findAllHolidays();
  const holidayDates = holidays.map(holiday => holiday.date);

  // Check if appointment date is a holiday
  if (holidayDates.includes(date)) {
    throw new Error('Appointment cannot be scheduled on a holiday');
  }

  // Use doctorId from the request
  return await createAppointment({ ...appointmentData, duration, doctor_id: doctorId });
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