const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const createAttendanceData = async (userId) => {
  // Fetch the list of all staff members
  const { data: staffData, error: staffError } = await supabase
    .from('dental_team')
    .select('*')
    .eq('user_id', userId);

  if (staffError) {
    return { error: staffError };
  }

  // Fetch the operating hours for the current date
  const dayOfWeek = moment().format('dddd').toLowerCase();
  const { data: operatingHoursData, error: operatingHoursError } = await supabase
    .from('operating_hours')
    .select('*')
    .eq('day', dayOfWeek)
    .eq('user_id', userId);

  if (operatingHoursError) {
    return { error: operatingHoursError };
  }

  // Fetch the list of holidays
  const { data: holidayData, error: holidayError } = await supabase
    .from('holidays')
    .select('*');

  if (holidayError) {
    return { error: holidayError };
  }

  // Check if the operating hours status is closed or if the day is a holiday
  if (operatingHoursData[0].status === 'closed' || holidayData.some(holiday => moment(holiday.date).isSame(moment(), 'day'))) {
    return { message: 'The clinic is closed today.' };
  }

  // Create attendance data for each staff member
  for (const staffMember of staffData) {
    const status = 'Working';
    await supabase
      .from('staff_attendances')
      .insert([{ date: moment().format('YYYY-MM-DD'), staff_member_id: staffMember.id, attendance_status: status, user_id: userId }]);
  }

  return { success: true, message: 'Attendance data created successfully.' };
}; 