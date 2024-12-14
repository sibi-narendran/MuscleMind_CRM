const { createAppointment, getAppointments, getAppointmentsByDate, updateAppointment, deleteAppointment, getTodayAppointments, getAppointmentsByDateRange } = require('../models/AppointmentModels');
const { getOperatingHoursByDay } = require('../models/OperatingHoursModels');
const { getTreatmentById } = require('../models/TreatmentModel');
const { findAllHolidays } = require('../models/holidayModel');

const addAppointment = async (appointmentData, userId) => {
  const { date, time, treatment_id, treatment_name, patient_id, patient_name } = appointmentData;
  console.log("Appointment Data:", appointmentData);
  console.log("Treatment ID:", treatment_id);
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
    if (apt.user_id === userId) { // Check only for the same doctor
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

  // Fetch holidays with user_id
  const holidays = await findAllHolidays(userId);
  const holidayDates = holidays.map(holiday => holiday.date);

  // Check if appointment date is a holiday
  if (holidayDates.includes(date)) {
    throw new Error('Appointment cannot be scheduled on a holiday');
  }

  // Include user_id and treatment_name in the appointment data before creating the appointment
  return await createAppointment({ ...appointmentData, duration, user_id: userId, treatment_name });
};

const fetchAppointments = async (userId) => {
  return await getAppointments(userId);
};

const modifyAppointment = async (id, updatedData, userId) => {
  try {
    // Ensure proper data types
    const sanitizedData = {
      ...updatedData,
      patient_id: updatedData.patient_id?.toString(),
      treatment_id: Number(updatedData.treatment_id),
      user_id: userId?.toString(),
      duration: Number(updatedData.duration)
    };

    // Validate required fields
    if (!sanitizedData.patient_id || !sanitizedData.treatment_id) {
      throw new Error('Missing required fields');
    }

    // Perform your validations here...

    // Update the appointment with sanitized data
    const result = await updateAppointment(id, sanitizedData);
    return result;

  } catch (error) {
    console.error('Error in modifyAppointment:', error);
    throw error;
  }
};

const removeAppointment = async (id) => {
  return await deleteAppointment(id);
};

const fetchTodayAppointments = async (userId) => {
  try {
    return await getTodayAppointments(userId);
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    throw error;
  }
};

const fetchAppointmentsByDateRange = async (userId, startDate, endDate) => {
  try {
    return await getAppointmentsByDateRange(userId, startDate, endDate);
  } catch (error) {
    console.error('Error fetching appointments by date range:', error);
    throw error;
  }
};

module.exports = { addAppointment, fetchAppointments, modifyAppointment, removeAppointment, fetchTodayAppointments, fetchAppointmentsByDateRange };