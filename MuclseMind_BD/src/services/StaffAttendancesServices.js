const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const createAttendanceData = async (userId) => {
  const currentDate = moment().format('YYYY-MM-DD');
  const dayOfWeek = moment().format('dddd').toLowerCase();

  // First check if today is a holiday
  const { data: holidayData, error: holidayError } = await supabase
    .from('holidays')
    .select('*')
    .eq('user_id', userId)
    .eq('date', currentDate);

  if (holidayError) {
    console.error('Error checking holidays:', holidayError);
    return { error: holidayError };
  }

  // If today is a holiday, don't create attendance
  if (holidayData && holidayData.length > 0) {
    console.log('Today is a holiday:', holidayData[0].name);
    return { message: `Today is a holiday: ${holidayData[0].name}` };
  }

  // Check operating hours for today
  const { data: operatingHoursData, error: operatingHoursError } = await supabase
    .from('operating_hours')
    .select('*')
    .eq('day', dayOfWeek)
    .eq('user_id', userId);

  if (operatingHoursError) {
    console.error('Error fetching operating hours:', operatingHoursError);
    return { error: operatingHoursError };
  }

  // Check if the clinic is closed or if there are no operating hours set
  if (!operatingHoursData || 
      operatingHoursData.length === 0 || 
      operatingHoursData[0].status === 'closed') {
    console.log('The clinic is closed today.');
    return { message: 'The clinic is closed today.' };
  }

  // Check if attendance already exists for today
  const { data: existingAttendance, error: existingError } = await supabase
    .from('staff_attendances')
    .select('*')
    .eq('user_id', userId)
    .eq('date', currentDate);

  if (existingError) {
    console.error('Error checking existing attendance:', existingError);
    return { error: existingError };
  }

  // If attendance already exists, don't create new records
  if (existingAttendance && existingAttendance.length > 0) {
    console.log('Attendance already created for today');
    return { message: 'Attendance already created for today' };
  }

  // Fetch staff members and create attendance
  const { data: staffData, error: staffError } = await supabase
    .from('dental_team')
    .select('*')
    .eq('user_id', userId);

  if (staffError) {
    console.error('Error fetching staff data:', staffError);
    return { error: staffError };
  }

  // Create attendance data for each staff member
  for (const staffMember of staffData) {
    const status = 'pending';
    const { error } = await supabase
      .from('staff_attendances')
      .insert([{
        date: currentDate,
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
  return { message: 'Attendance data created successfully.' };
};

module.exports = { createAttendanceData }; 