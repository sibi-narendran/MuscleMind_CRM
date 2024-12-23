const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getAttendances = async (date, userId) => {
  // Fetch the list of all staff members
  const { data: staffData, error: staffError } = await supabase
    .from('dental_team')
    .select('*')
    .eq('user_id', userId);

  if (staffError) {
    return { error: staffError };
  }

  // Fetch the attendance data for the selected date
  const { data: attendanceData, error: attendanceError } = await supabase
    .from('staff_attendances')
    .select('*, dental_team(doj)')
    .eq('date', date)
    .eq('user_id', userId);

  if (attendanceError) {
    return { error: attendanceError };
  }

  // Fetch the operating hours for the selected date
  const dayOfWeek = moment(date).format('dddd').toLowerCase();
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
  if (operatingHoursData && operatingHoursData.length > 0 && operatingHoursData[0].status === 'closed' || holidayData.some(holiday => moment(holiday.date).isSame(moment(date), 'day'))) {    return { message: 'The clinic is closed today.' };
  }

  // Create attendance data for each staff member if it doesn't exist
  for (const staffMember of staffData) {
    if (!attendanceData.some(attendance => attendance.staff_member_id === staffMember.id)) {
      const status = moment(staffMember.doj).isAfter(moment(date)) || holidayData.some(holiday => moment(holiday.date).isSame(moment(date), 'day')) || operatingHoursData[0].status === 'closed' ? 'Holiday' : 'Working';
      await supabase
        .from('staff_attendances')
        .insert([{ date, staff_member_id: staffMember.id, attendance_status: status, user_id: userId }]);
    }
  }

  // Fetch the updated attendance data
  const { data: updatedAttendanceData, error: updatedAttendanceError } = await supabase
    .from('staff_attendances')
    .select('*, dental_team(doj)')
    .eq('date', date)
    .eq('user_id', userId);

  if (updatedAttendanceError) {
    return { error: updatedAttendanceError };
  }

  return { data: updatedAttendanceData };
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
