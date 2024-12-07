const express = require('express');
const controller = require('../../controller/staffAttendanceController');
const { authenticateJWTUserID } = require('../../middleware/authMiddleware');
const staff_attendances = express.Router();

staff_attendances.get('/attendances/:date', authenticateJWTUserID, controller.fetchAttendances);
staff_attendances.put('/attendance/:id', authenticateJWTUserID, controller.editAttendanceStatus);
staff_attendances.get('/monthly-attendance/:dental_team_id',authenticateJWTUserID, controller.getEmployeeAttendance);


module.exports = staff_attendances;
