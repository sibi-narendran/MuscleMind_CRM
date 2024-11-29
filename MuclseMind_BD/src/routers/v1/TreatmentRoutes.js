const express = require('express');
const { addTreatmentController, getTreatmentsController, editTreatmentController, deleteTreatmentController } = require('../../controller/TreatmentController.js');
const { authenticateJWT } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/addTreatment', authenticateJWT, addTreatmentController);
router.get('/getTreatments', authenticateJWT, getTreatmentsController);
router.put('/editTreatment/:id', authenticateJWT, editTreatmentController);
router.delete('/deleteTreatment/:id', authenticateJWT, deleteTreatmentController);

module.exports = router;
