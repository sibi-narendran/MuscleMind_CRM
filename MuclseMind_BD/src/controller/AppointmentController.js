const { addAppointment, fetchAppointments, modifyAppointment, removeAppointment } = require('../services/AppointmentService');
const { createResponse } = require('../utils/responseUtil');

const addAppointmentController = async (req, res) => {
  try {
    const appointmentData = req.body;
    const userId = req.user.userId; // Extract user ID from JWT

    if (!userId) {
      return res.status(400).json(createResponse(false, 'User ID is undefined'));
    }

    const result = await addAppointment(appointmentData, userId);
    res.status(201).json(createResponse(true, 'Appointment added successfully', result));
  } catch (error) {
    console.error('Failed to add appointment:', error);
    res.status(500).json(createResponse(false, 'Failed to add appointment', null, error.message));
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
    const updatedAppointment = await modifyAppointment(id, updatedData);
    res.status(200).json(createResponse(true, 'Appointment updated successfully', updatedAppointment));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to update appointment', null, error.message));
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

module.exports = { addAppointmentController, getAppointmentsController, updateAppointmentController, deleteAppointmentController }; 