const cron = require('node-cron');
const StaffAttendancesServices = require('../services/StaffAttendancesServices');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to handle attendance data creation for all users
async function createAttendanceDataForAllUsers() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id');

    if (error) {
      console.error('Failed to fetch users:', error);
      return;
    }

    // Process users sequentially to avoid overwhelming the database
    for (const user of users) {
      try {
        const result = await StaffAttendancesServices.createAttendanceData(user.id);
        console.log(`Attendance processing for user ${user.id}:`, result);
      } catch (error) {
        console.error(`Error processing attendance for user ${user.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in createAttendanceDataForAllUsers:', error);
  }
}

// Schedule a job to run at 6:00 AM (06:00) every day for all users
cron.schedule('0 6 * * *', createAttendanceDataForAllUsers, {
  scheduled: true,
  timezone: "Asia/Kolkata"
}); 