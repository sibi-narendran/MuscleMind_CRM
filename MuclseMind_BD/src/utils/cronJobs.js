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
  const { data: users, error } = await supabase
    .from('users')
    .select('id');

  if (error) {
    console.error('Failed to fetch users:', error);
    return;
  }

  users.forEach(user => {
    StaffAttendancesServices.createAttendanceData(user.id);
  });
}

// Schedule a job to run at 12:00 AM (midnight) every day for all users
cron.schedule('0 0 * * *', createAttendanceDataForAllUsers); 