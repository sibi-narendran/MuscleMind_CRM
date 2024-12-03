const express = require('express');
const controller = require('../../controller/staffAttendanceController');
const { authenticateJWTUserID } = require('../../middleware/authMiddleware');
const staff_attendances = express.Router();

staff_attendances.get('/attendances/:date', authenticateJWTUserID, controller.fetchAttendances);
staff_attendances.put('/attendance/:id', authenticateJWTUserID, controller.editAttendanceStatus);

module.exports = staff_attendances;
