const cron = require('node-cron');
const AttendanceCreationService = require('../services/AttendanceCreationService');
const { createClient } = require('@supabase/supabase-js');
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Function to log cron execution
const logCronExecution = async (message, error = null) => {
    try {
        await supabase
            .from('cron_logs')
            .insert({
                job_name: 'attendance_creation',
                execution_time: new Date().toISOString(),
                status: error ? 'error' : 'success',
                message: message,
                error: error ? error.message : null
            });
    } catch (logError) {
        console.error('Error logging cron execution:', logError);
    }
};

// Function to check if attendance was already created for today
const checkTodayAttendance = async () => {
    const today = moment().format('YYYY-MM-DD');
    const { data, error } = await supabase
        .from('cron_logs')
        .select('*')
        .eq('job_name', 'attendance_creation')
        .eq('status', 'success')
        .gte('execution_time', today)
        .lt('execution_time', moment().add(1, 'day').format('YYYY-MM-DD'));

    if (error) {
        console.error('Error checking today\'s attendance:', error);
        return true; // Assume already created to prevent duplicate creation
    }

    return data && data.length > 0;
};

// Main function to create attendance
const createDailyAttendance = async () => {
    console.log('Starting daily attendance creation process...');
    
    try {
        // Check if attendance was already created today
        const alreadyCreated = await checkTodayAttendance();
        if (alreadyCreated) {
            console.log('Attendance already created for today');
            return;
        }

        // Create attendance
        const result = await AttendanceCreationService.createDailyAttendances();

        if (result.success) {
            await logCronExecution('Daily attendance created successfully');
            console.log('Daily attendance creation completed successfully');
        } else {
            throw new Error(result.error || 'Failed to create attendance');
        }
    } catch (error) {
        console.error('Error in daily attendance creation:', error);
        await logCronExecution('Failed to create daily attendance', error);
    }
};

// Retry mechanism for failed attendance creation
const retryFailedAttendance = async () => {
    try {
        const today = moment().format('YYYY-MM-DD');
        const { data: failedLogs } = await supabase
            .from('cron_logs')
            .select('*')
            .eq('job_name', 'attendance_creation')
            .eq('status', 'error')
            .gte('execution_time', today)
            .lt('execution_time', moment().add(1, 'day').format('YYYY-MM-DD'));

        if (failedLogs?.length > 0) {
            console.log('Retrying failed attendance creation...');
            await createDailyAttendance();
        }
    } catch (error) {
        console.error('Error in retry mechanism:', error);
    }
};

// Schedule main attendance creation - Runs at 12:01 AM every day
cron.schedule('37 11 * * *', createDailyAttendance, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Adjust timezone as needed
});

// Schedule retry for failed attendance - Runs every hour from 1 AM to 11 AM
cron.schedule('0 1-11 * * *', retryFailedAttendance, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Adjust timezone as needed
});

// Manual trigger function for testing
const triggerManualAttendanceCreation = async () => {
    console.log('Manually triggering attendance creation...');
    await createDailyAttendance();
};

module.exports = {
    createDailyAttendance,
    triggerManualAttendanceCreation
}; 