const express = require('express');
const { addAppointmentController, getAppointmentsController, updateAppointmentController, deleteAppointmentController, getTodayAppointmentsController, getAppointmentsByDateRangeController } = require('../../controller/AppointmentController');
const { authenticateJWTUserID } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/addAppointment', authenticateJWTUserID, addAppointmentController);
router.get('/getAppointments', authenticateJWTUserID, getAppointmentsController);
router.put('/updateAppointment/:id', authenticateJWTUserID, updateAppointmentController);
router.delete('/deleteAppointment/:id', authenticateJWTUserID, deleteAppointmentController);
router.get('/today', authenticateJWTUserID, getTodayAppointmentsController);
router.get('/date-range', authenticateJWTUserID, getAppointmentsByDateRangeController);

module.exports = router; 