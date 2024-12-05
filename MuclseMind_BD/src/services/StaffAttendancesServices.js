const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const createAttendanceData = async (userId) => {
  // Validate userId format (assuming UUID format)
  if (!userId || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId)) {
    console.error('Invalid UUID format for userId:', userId);
    return { error: 'Invalid UUID format for userId' };
  }

  // Fetch the list of all staff members for the specific user
  const { data: staffData, error: staffError } = await supabase
    .from('dental_team')
    .select('*')
    .eq('user_id', userId);

  if (staffError) {
    console.error('Error fetching staff data:', staffError);
    return { error: staffError };
  }

  // Fetch the operating hours for the current date for the specific user
  const dayOfWeek = moment().format('dddd').toLowerCase();
  const { data: operatingHoursData, error: operatingHoursError } = await supabase
    .from('operating_hours')
    .select('*')
    .eq('day', dayOfWeek)
    .eq('user_id', userId);

  if (operatingHoursError) {
    console.error('Error fetching operating hours:', operatingHoursError);
    return { error: operatingHoursError };
  }

  // Check if the clinic is closed today
  if (!operatingHoursData.length || operatingHoursData[0].status === 'closed') {
    console.log('The clinic is closed today.');
    return { message: 'The clinic is closed today.' };
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
  return { message: 'Attendance data created successfully.' };
};

module.exports = { createAttendanceData }; 