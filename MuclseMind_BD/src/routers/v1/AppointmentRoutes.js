const express = require('express');
const { addAppointmentController, getAppointmentsController, updateAppointmentController, deleteAppointmentController } = require('../../controller/AppointmentController');
const { authenticateJWT } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/addAppointment', authenticateJWT, addAppointmentController);
router.get('/getAppointments', authenticateJWT, getAppointmentsController);
router.put('/updateAppointment/:id', authenticateJWT, updateAppointmentController);
router.delete('/deleteAppointment/:id', authenticateJWT, deleteAppointmentController);

module.exports = router; 