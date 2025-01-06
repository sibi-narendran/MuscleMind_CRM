const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../../middleware/authMiddleware');
const consultantAttendanceController = require('../../controller/consultantAttendanceController');

// Base path: /v1/consultant-attendances

router.get(
    '/consultant/:date',
    authenticateJWT,
    consultantAttendanceController.fetchConsultantAttendances
);

router.get(
    '/consultant-details/:id/:date',
    authenticateJWT,
    consultantAttendanceController.getConsultantDetails
);

router.put(
    '/consultant-attendance-update/:id',
    authenticateJWT,
    consultantAttendanceController.updateConsultantAttendance
);

router.get(
    '/consultant-report/:id',
    authenticateJWT,
    consultantAttendanceController.downloadConsultantReport
);

module.exports = router; 