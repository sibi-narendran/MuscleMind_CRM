const express = require('express');
const controller = require('../../controller/prescriptionController');
const { authenticateJWTUserID } = require('../../middleware/authMiddleware');
const prescriptionRouter = express.Router();

prescriptionRouter.get('/get-prescription', authenticateJWTUserID, controller.getPrescriptions);
prescriptionRouter.post('/add-prescription', authenticateJWTUserID, controller.createPrescription);
prescriptionRouter.put('/update-prescription/:id', authenticateJWTUserID, controller.updatePrescription);
prescriptionRouter.delete('/delete-prescription/:id', authenticateJWTUserID, controller.deletePrescription);

module.exports = prescriptionRouter;