const express = require('express');
const controller = require('../../controller/holidayController');
const { authenticateJWT } = require('../../middleware/authMiddleware');
const holidays = express.Router();

holidays.post('/addHoliday', authenticateJWT, controller.addHoliday);
holidays.get('/getHolidays', authenticateJWT, controller.getHolidays);
holidays.put('/updateHoliday/:id', authenticateJWT, controller.updateHoliday);
holidays.delete('/deleteHoliday/:id', authenticateJWT, controller.deleteHoliday);

module.exports = holidays; 