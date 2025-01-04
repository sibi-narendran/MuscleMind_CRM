const express = require('express');
const { addMedicationController, getMedicationsController, editMedicationController, deleteMedicationController } = require('../../controller/MedicationController');
const { authenticateJWT } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/addMedication', authenticateJWT, addMedicationController);
router.get('/getMedications', authenticateJWT, getMedicationsController);
router.put('/editMedication/:id', authenticateJWT, editMedicationController);
router.delete('/deleteMedication/:id', authenticateJWT, deleteMedicationController);

module.exports = router;
