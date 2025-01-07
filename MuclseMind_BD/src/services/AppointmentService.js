const { createAppointment, getAppointments, getAppointmentsByDate, updateAppointment, deleteAppointment, getTodayAppointments, getAppointmentsByDateRange } = require('../models/AppointmentModels');
const { getOperatingHoursByDay } = require('../models/OperatingHoursModels');
const { getTreatmentById } = require('../models/TreatmentModel');
const { findAllHolidays } = require('../models/holidayModel');
const { sendAppointmentNotification } = require('./twilioService');

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const addAppointment = async (appointmentData, userId) => {
  try {
    const { date, time, treatment_id, treatment_name, patient_id, patient_name } = appointmentData;

    console.log("Appointment Data:", appointmentData);
    
    // Check if treatment_id exists
    if (!treatment_id) {
      return {
        success: false,
        error: 'Treatment ID is required'
      };
    }

    // Get the day of the week from the appointment date
    const appointmentDate = new Date(date);
    const day = appointmentDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    console.log("Checking operating hours for day:", day);

    // Check operating hours
    const operatingHours = await getOperatingHoursByDay(day, userId);
    console.log("Operating hours for day:", operatingHours);

    if (!operatingHours) {
      return {
        success: false,
        error: `Operating hours not found for ${day}`
      };
    }

    if (operatingHours.status !== 'open') {
      return {
        success: false,
        error: `Clinic is closed on ${day}`
      };
    }

    // Debug logging for shift times
    console.log("Appointment time:", time);
    console.log("Shift 1:", operatingHours.shift_1_open_time, "-", operatingHours.shift_1_close_time);
    console.log("Shift 2:", operatingHours.shift_2_open_time, "-", operatingHours.shift_2_close_time);

    // Convert all times to minutes since midnight for easier comparison
    const appointmentMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    
    const shift1Start = operatingHours.shift_1_open_time ? 
      parseInt(operatingHours.shift_1_open_time.split(':')[0]) * 60 + parseInt(operatingHours.shift_1_open_time.split(':')[1]) : null;
    const shift1End = operatingHours.shift_1_close_time ? 
      parseInt(operatingHours.shift_1_close_time.split(':')[0]) * 60 + parseInt(operatingHours.shift_1_close_time.split(':')[1]) : null;
    const shift2Start = operatingHours.shift_2_open_time ? 
      parseInt(operatingHours.shift_2_open_time.split(':')[0]) * 60 + parseInt(operatingHours.shift_2_open_time.split(':')[1]) : null;
    const shift2End = operatingHours.shift_2_close_time ? 
      parseInt(operatingHours.shift_2_close_time.split(':')[0]) * 60 + parseInt(operatingHours.shift_2_close_time.split(':')[1]) : null;

    // Debug logging for time comparisons
    console.log("Times in minutes:");
    console.log("Appointment:", appointmentMinutes);
    console.log("Shift 1:", shift1Start, "-", shift1End);
    console.log("Shift 2:", shift2Start, "-", shift2End);

    const isInShift1 = shift1Start !== null && shift1End !== null && 
      appointmentMinutes >= shift1Start && appointmentMinutes < shift1End;
    const isInShift2 = shift2Start !== null && shift2End !== null && 
      appointmentMinutes >= shift2Start && appointmentMinutes < shift2End;

    console.log("Is in shift 1:", isInShift1);
    console.log("Is in shift 2:", isInShift2);

    if (!isInShift1 && !isInShift2) {
      return {
        success: false,
        error: `Appointment time ${time} is outside of operating hours. Available times are ${operatingHours.shift_1_open_time?.slice(0, 5)}-${operatingHours.shift_1_close_time?.slice(0, 5)} and ${operatingHours.shift_2_open_time?.slice(0, 5)}-${operatingHours.shift_2_close_time?.slice(0, 5)}`
      };
    }

    // Check treatment duration
    console.log("Fetching treatment details for ID:", treatment_id);
    const treatmentDetails = await getTreatmentById(treatment_id);
    console.log("Treatment details:", treatmentDetails);

    if (!treatmentDetails || !Array.isArray(treatmentDetails) || treatmentDetails.length === 0) {
      return {
        success: false,
        error: `Treatment not found for ID: ${treatment_id}`
      };
    }

    const duration = treatmentDetails[0].duration;
    if (!duration) {
      return {
        success: false,
        error: `Duration not found for treatment ID: ${treatment_id}`
      };
    }

    // Check if appointment end time exceeds shift boundaries
    const appointmentEndMinutes = appointmentMinutes + duration;
    
    if (isInShift1 && appointmentEndMinutes > shift1End) {
      return {
        success: false,
        error: `Appointment duration (${duration} minutes) exceeds shift 1 end time (${operatingHours.shift_1_close_time?.slice(0, 5)})`
      };
    }
    if (isInShift2 && appointmentEndMinutes > shift2End) {
      return {
        success: false,
        error: `Appointment duration (${duration} minutes) exceeds shift 2 end time (${operatingHours.shift_2_close_time?.slice(0, 5)})`
      };
    }

    // Check for overlapping appointments
    const appointments = await getAppointmentsByDate(date);
    console.log("Existing Appointments on Date:", date, appointments);

    for (const apt of appointments) {
      if (apt.user_id === userId) {
        const aptTime = apt.time.split(':');
        const aptMinutes = parseInt(aptTime[0]) * 60 + parseInt(aptTime[1]);
        const aptEndMinutes = aptMinutes + apt.duration;

        if ((appointmentMinutes >= aptMinutes && appointmentMinutes < aptEndMinutes) || 
            (appointmentEndMinutes > aptMinutes && appointmentEndMinutes <= aptEndMinutes) ||
            (appointmentMinutes <= aptMinutes && appointmentEndMinutes >= aptEndMinutes)) {
          return {
            success: false,
            error: `Appointment time overlaps with existing appointment at ${apt.time}`
          };
        }
      }
    }

    // Fetch holidays with user_id
    const holidays = await findAllHolidays(userId);
    const holidayDates = holidays.map(holiday => holiday.date);

    // Check if appointment date is a holiday
    if (holidayDates.includes(date)) {
      return {
        success: false,
        error: 'Appointment cannot be scheduled on a holiday'
      };
    }

    // If all validations pass, create the appointment
    const appointmentWithDuration = {
      ...appointmentData,
      duration,
      user_id: userId
    };

    console.log("Creating appointment with data:", appointmentWithDuration);

    // Create the appointment in the database
    const { data: newAppointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([appointmentWithDuration])
      .select()
      .single();

    if (appointmentError) {
      console.error("Database error:", appointmentError);
      return {
        success: false,
        error: `Failed to create appointment: ${appointmentError.message}`
      };
    }

    if (!newAppointment) {
      return {
        success: false,
        error: 'Appointment was not created - no data returned from database'
      };
    }

    // Handle notifications
    try {
      await sendAppointmentNotification({
        patientName: appointmentData.patient_name,
        patientPhone: appointmentData.patient_phone,
        doctorName: appointmentData.care_person,
        doctorPhone: appointmentData.doctor_phone,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        type: 'SCHEDULED',
        clinic_name: appointmentData.clinic_name
      });
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Log the error but don't fail the appointment creation
    }

    return {
      success: true,
      data: newAppointment
    };

  } catch (error) {
    console.error('Error in addAppointment:', error);
    return {
      success: false,
      error: `Failed to add appointment: ${error.message}`
    };
  }
};

const fetchAppointments = async (userId) => {
  return await getAppointments(userId);
};

const modifyAppointment = async (id, updatedData) => {
  try {
    // If time or date is being updated, validate against operating hours
    if (updatedData.time || updatedData.date) {
      const date = updatedData.date;
      const time = updatedData.time;
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

      // Check if appointment time falls within either shift
      const shift1Start = operatingHours.shift_1_open_time ? new Date(`${date}T${operatingHours.shift_1_open_time}`) : null;
      const shift1End = operatingHours.shift_1_close_time ? new Date(`${date}T${operatingHours.shift_1_close_time}`) : null;
      const shift2Start = operatingHours.shift_2_open_time ? new Date(`${date}T${operatingHours.shift_2_open_time}`) : null;
      const shift2End = operatingHours.shift_2_close_time ? new Date(`${date}T${operatingHours.shift_2_close_time}`) : null;

      const isInShift1 = shift1Start && shift1End && 
        appointmentTime >= shift1Start && appointmentTime < shift1End;
      const isInShift2 = shift2Start && shift2End && 
        appointmentTime >= shift2Start && appointmentTime < shift2End;

      if (!isInShift1 && !isInShift2) {
        throw new Error('Appointment time is outside of operating hours. Please choose a time within shift 1 or shift 2');
      }

      // Check treatment duration
      const treatmentDetails = await getTreatmentById(updatedData.treatment_id);
      const duration = Array.isArray(treatmentDetails) && treatmentDetails.length > 0 ? treatmentDetails[0].duration : undefined;

      if (duration === undefined) {
        throw new Error('Duration not found for the treatment');
      }

      const endTime = new Date(appointmentTime.getTime() + duration * 60000);

      // Check if appointment end time exceeds shift boundaries
      if (isInShift1 && endTime > shift1End) {
        throw new Error('Appointment duration exceeds shift 1 end time');
      }
      if (isInShift2 && endTime > shift2End) {
        throw new Error('Appointment duration exceeds shift 2 end time');
      }

      // Check for overlapping appointments
      const appointments = await getAppointmentsByDate(date);
      for (const apt of appointments) {
        if (apt.id !== id && apt.user_id === updatedData.user_id) { // Skip current appointment
          const aptStartTime = new Date(`${apt.date}T${apt.time}`);
          const aptEndTime = new Date(aptStartTime.getTime() + apt.duration * 60000);

          if ((appointmentTime >= aptStartTime && appointmentTime < aptEndTime) || 
              (endTime > aptStartTime && endTime <= aptEndTime) ||
              (appointmentTime <= aptStartTime && endTime >= aptEndTime)) {
            throw new Error('Appointment time overlaps with another appointment');
          }
        }
      }

      // Check holidays
      const holidays = await findAllHolidays(updatedData.user_id);
      const holidayDates = holidays.map(holiday => holiday.date);
      if (holidayDates.includes(date)) {
        throw new Error('Appointment cannot be scheduled on a holiday');
      }
    }

    // Ensure proper data types
    const sanitizedData = {
      ...updatedData,
      patient_id: updatedData.patient_id?.toString(),
      treatment_id: Number(updatedData.treatment_id),
      user_id: updatedData.user_id?.toString(),
      duration: Number(updatedData.duration)
    };

    // Validate required fields
    if (!sanitizedData.patient_id || !sanitizedData.treatment_id) {
      throw new Error('Missing required fields');
    }

    // Update the appointment with sanitized data
    const result = await updateAppointment(id, sanitizedData);
    
    // Send notifications based on status change
    if (result.success && updatedData.status) {
      await sendAppointmentNotification(updatedData, updatedData.status.toUpperCase());
    }

    return result;

  } catch (error) {
    console.error('Error in modifyAppointment:', error);
    return {
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    };
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