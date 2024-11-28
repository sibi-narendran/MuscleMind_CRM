const { addAppointment, fetchAppointments, modifyAppointment, removeAppointment } = require('../services/AppointmentService.js');
const { createResponse } = require('../utils/responseUtil.js');

const addAppointmentController = async (req, res) => {
  try {
    const appointmentData = req.body;
    const newAppointment = await addAppointment(appointmentData);
    res.status(201).json(createResponse(true, 'Appointment added successfully', newAppointment));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to add appointment', null, error.message));
  }
};

const getAppointmentsController = async (req, res) => {
  try {
    const appointments = await fetchAppointments();
    res.status(200).json(createResponse(true, 'Appointments fetched successfully', appointments));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to fetch appointments', null, error.message));
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