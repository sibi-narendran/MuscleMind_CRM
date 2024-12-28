const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getAttendances = async (date, userId) => {
  // First check if today is a holiday
  const { data: holidayData, error: holidayError } = await supabase
    .from('holidays')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  if (holidayError) {
    return { error: holidayError };
  }

  if (holidayData && holidayData.length > 0) {
    return { message: `Today is a holiday: ${holidayData[0].name}`, data: [] };
  }

  // Check operating hours for the day
  const dayOfWeek = moment(date).format('dddd').toLowerCase();
  const { data: operatingHoursData, error: operatingHoursError } = await supabase
    .from('operating_hours')
    .select('*')
    .eq('day', dayOfWeek)
    .eq('user_id', userId);

  if (operatingHoursError) {
    return { error: operatingHoursError };
  }

  // If clinic is closed or no operating hours set
  if (!operatingHoursData || 
      operatingHoursData.length === 0 || 
      operatingHoursData[0].status === 'closed') {
    return { message: 'The clinic is closed today.', data: [] };
  }

  // Rest of your existing code for fetching staff and attendance data
  const { data: staffData, error: staffError } = await supabase
    .from('dental_team')
    .select('*')
    .eq('user_id', userId);

  if (staffError) {
    return { error: staffError };
  }

  // If no staff members found
  if (!staffData || staffData.length === 0) {
    return { message: 'No staff members found.', data: [] };
  }

  // Your existing attendance data fetching code
  const { data: attendanceData, error: attendanceError } = await supabase
    .from('staff_attendances')
    .select('*, dental_team(doj)')
    .eq('date', date)
    .eq('user_id', userId);

  if (attendanceError) {
    return { error: attendanceError };
  }

  return { data: attendanceData || [] };
};

const updateAttendanceStatus = async (id, status, userId) => {
    const { data, error } = await supabase
        .from('staff_attendances')
        .update({ attendance_status: status })
        .match({ id, user_id: userId });
    return { data, error };
};

const fetchEmployeeAttendance = async (dental_team_id, user_id) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  try {
    const { data, error } = await supabase
      .from('staff_attendances')
      .select('*')
      .eq('dental_team_id', dental_team_id)
      .eq('user_id', user_id)  // Ensure that the data fetched is specific to the user
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching monthly attendance data:', error);
      throw new Error('Failed to fetch monthly attendance data');
    }

    return data;
  } catch (error) {
    console.error('Error during fetching monthly attendance data:', error.message);
    throw new Error('Error in fetching monthly attendance data');
  }
};



module.exports = { getAttendances, updateAttendanceStatus, fetchEmployeeAttendance };
