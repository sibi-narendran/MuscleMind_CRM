const express = require('express');
const { addAppointmentController, getAppointmentsController, updateAppointmentController, deleteAppointmentController } = require('../../controller/AppointmentController.js');

const router = express.Router();

router.post('/addAppointments', addAppointmentController);
router.get('/getAppointments', getAppointmentsController);
router.put('/updateAppointments/:id', updateAppointmentController);
router.delete('/deleteAppointments/:id', deleteAppointmentController);

module.exports = router; 