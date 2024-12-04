const cron = require('node-cron');
const StaffAttendancesServices = require('../services/StaffAttendancesServices');

// Schedule a job to run at 10:50 every day
cron.schedule('50 10 * * *', StaffAttendancesServices.createAttendanceData); 