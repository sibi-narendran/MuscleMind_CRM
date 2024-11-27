const express = require('express');
const { addPatientController, getPatientsController, editPatientController, deletePatientController } = require('../../controller/PatientController.js');
const { authenticateJWT } = require('../../middleware/authMiddleware.js');

const router = express.Router();

router.post('/addPatients', authenticateJWT, addPatientController);
router.get('/getPatients', authenticateJWT, getPatientsController);
router.put('/updatePatients/:id', authenticateJWT, editPatientController);
router.delete('/deletePatients/:id', authenticateJWT, deletePatientController);

module.exports = router;