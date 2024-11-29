const express = require('express');
const { addClinicController, getClinicsController, editClinicController, deleteClinicController } = require('../../controller/ClinicController.js');
const { authenticateJWT } = require('../../middleware/authMiddleware.js');

const router = express.Router();

router.post('/clinics', authenticateJWT, addClinicController);
router.get('/clinics', authenticateJWT, getClinicsController);
router.put('/clinics/:id', authenticateJWT, editClinicController);
router.delete('/clinics/:id', authenticateJWT, deleteClinicController);

module.exports = router;
