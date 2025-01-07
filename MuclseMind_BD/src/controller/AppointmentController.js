const { addAppointment, fetchAppointments, modifyAppointment, removeAppointment, fetchTodayAppointments, fetchAppointmentsByDateRange } = require('../services/AppointmentService');
const { createResponse } = require('../utils/responseUtil');

const addAppointmentController = async (req, res) => {
  try {
    const appointmentData = req.body;
    console.log("Received appointment data:", appointmentData);

    // Validate required fields
    if (!appointmentData || Object.keys(appointmentData).length === 0) {
      return res.status(400).send({
        success: false,
        message: 'Appointment data is required',
        data: null,
        error: 'Empty request body'
      });
    }

    // Validate essential fields
    const requiredFields = ['date', 'time', 'treatment_id', 'patient_id'];
    const missingFields = requiredFields.filter(field => !appointmentData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).send({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        data: null,
        error: 'Missing required fields'
      });
    }

    const userId = req.user.userId;
    console.log("User ID:", userId);

    const result = await addAppointment(appointmentData, userId);
    console.log("Service result:", result); // Debug log
    
    // Check if there's an error in the result
    if (!result.success) {
      return res.status(400).send({
        success: false,
        message: result.error || 'Failed to add appointment',
        data: null,
        error: result.error || 'Unknown error occurred'
      });
    }

    // If successful
    return res.status(201).send({
      success: true,
      message: 'Appointment added successfully',
      data: result.data,
      error: null
    });
  } catch (error) {
    console.error('Failed to add appointment:', error);
    return res.status(500).send({
      success: false,
      message: error.message || 'Failed to add appointment',
      data: null,
      error: error.message || 'Internal server error'
    });
  }
};

const getAppointmentsController = async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from JWT

    const appointments = await fetchAppointments(userId);
    res.status(200).json(createResponse(true, 'Appointments retrieved successfully', appointments));
  } catch (error) {
    console.error('Failed to retrieve appointments:', error);
    res.status(500).json(createResponse(false, 'Failed to retrieve appointments', error.message));
  }
};

const updateAppointmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const result = await modifyAppointment(id, updatedData);

    // Check if there's an error in the result
    if (!result.success) {
      return res.status(400).json(createResponse(
        false,
        result.error, // Use the error message as the main message
        null,
        result.error
      ));
    }

    // If successful
    res.status(200).json(createResponse(
      true,
      'Appointment updated successfully',
      result.data
    ));
  } catch (error) {
    res.status(500).json(createResponse(
      false,
      error.message || 'Failed to update appointment',
      null,
      error.message
    ));
  }
};

const deleteAppointmentController = async (req, res) => {
  try {
    const { id } = req.params;
    await removeAppointment(id);
    res.status(200).json(createResponse(true, 'Appointment deleted successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to delete appointment', null, error.message));
  }
};

const getTodayAppointmentsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const appointments = await fetchTodayAppointments(userId);
    res.status(200).json(createResponse(true, 'Today\'s appointments retrieved successfully', appointments));
  } catch (error) {
    console.error('Failed to retrieve today\'s appointments:', error);
    res.status(500).json(createResponse(false, 'Failed to retrieve today\'s appointments', null, error.message));
  }
};

const getAppointmentsByDateRangeController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json(createResponse(false, 'Start date and end date are required', null));
    }

    const appointments = await fetchAppointmentsByDateRange(userId, startDate, endDate);
    res.status(200).json(createResponse(true, 'Appointments retrieved successfully', appointments));
  } catch (error) {
    console.error('Failed to retrieve appointments:', error);
    res.status(500).json(createResponse(false, 'Failed to retrieve appointments', null, error.message));
  }
};

module.exports = { addAppointmentController, getAppointmentsController, updateAppointmentController, deleteAppointmentController, getTodayAppointmentsController, getAppointmentsByDateRangeController }; 