// MuclseMind_BD/src/routers/v1/OperatingHoursRoutes.js
const express = require('express');
const { getOperatingHoursController, updateOperatingHoursController } = require('../../controller/OperatingHoursController.js');
const { authenticateJWTUserID } = require('../../middleware/authMiddleware.js');

const router = express.Router();

router.get('/operating-hours', authenticateJWTUserID, getOperatingHoursController);
router.put('/operating-hours', authenticateJWTUserID, updateOperatingHoursController);

module.exports = router;