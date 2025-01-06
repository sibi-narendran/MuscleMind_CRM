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


router.post('/create-attendance', authenticateJWT, staffAttendanceController.createManualAttendance);

// Add these new routes
router.get(
    '/staff-details/:id/:date',
    authenticateJWT,
    staffAttendanceController.getStaffDetails
);

router.get(
    '/staff-report/:id',
    authenticateJWT,
    staffAttendanceController.downloadStaffReport
);

module.exports = router;
