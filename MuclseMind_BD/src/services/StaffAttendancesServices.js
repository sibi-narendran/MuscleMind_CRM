const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const createAttendanceData = async () => {
  // Fetch the list of all staff members
  const { data: staffData, error: staffError } = await supabase
    .from('dental_team')
    .select('*');

  if (staffError) {
    console.error('Error fetching staff data:', staffError);
    return { error: staffError };
  }

  // Fetch the operating hours for the current date
  const dayOfWeek = moment().format('dddd').toLowerCase();
  const { data: operatingHoursData, error: operatingHoursError } = await supabase
    .from('operating_hours')
    .select('*')
    .eq('day', dayOfWeek);

  if (operatingHoursError) {
    console.error('Error fetching operating hours:', operatingHoursError);
    return { error: operatingHoursError };
  }

  // Fetch the list of holidays
  const { data: holidayData, error: holidayError } = await supabase
    .from('holidays')
    .select('*')
    .eq('date', moment().format('YYYY-MM-DD'));

  if (holidayError) {
    console.error('Error fetching holidays:', holidayError);
    return { error: holidayError };
  }

  // Check if the operating hours status is closed or if the day is a holiday
  if (operatingHoursData[0].status === 'closed' || holidayData.length > 0) {
    console.log('The clinic is closed today.');
    return;
  }

  // Create attendance data for each staff member
  for (const staffMember of staffData) {
    const status = 'pending';
    const { error } = await supabase
      .from('staff_attendances')
      .insert([{
        date: moment().format('YYYY-MM-DD'),
        dental_team_id: staffMember.id,
        attendance_status: status,
        user_id: staffMember.user_id,
        name: staffMember.name,
        role: staffMember.role,
        doj: staffMember.doj,
        salary: staffMember.salary
      }]);

    if (error) {
      console.error('Error creating attendance data:', error);
      return { error };
    }
  }

  console.log('Attendance data created successfully.');
};

module.exports = { createAttendanceData }; 