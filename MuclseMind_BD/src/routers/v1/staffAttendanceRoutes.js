const express = require('express');
const router = express.Router();
const staffAttendanceController = require('../../controller/staffAttendanceController');
const { authenticateJWT } = require('../../middleware/authMiddleware');

// Staff Attendance Routes
router.get(
    '/staff-attendances/:date',
    authenticateJWT,
    staffAttendanceController.fetchAttendances
);

router.put(
    '/staff-attendances-update/:id',
    authenticateJWT,
    staffAttendanceController.editAttendanceStatus
);

router.get(
    '/staff-monthly-summary/:date',
    authenticateJWT,
    staffAttendanceController.getMonthlyAttendanceSummary
);

// Consultant Attendance Routes
router.get(
    '/consultant-attendances/:date',
    authenticateJWT,
    staffAttendanceController.getConsultantAttendances
);

router.put(
    '/consultant-attendance-update/:id',
    authenticateJWT,
    staffAttendanceController.updateConsultantAttendanceStatus
);

router.post('/create-attendance', authenticateJWT, staffAttendanceController.createManualAttendance);


module.exports = router;
