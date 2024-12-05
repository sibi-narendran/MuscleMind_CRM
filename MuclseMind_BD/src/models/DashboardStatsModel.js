const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const { format, startOfWeek } = require('date-fns');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const getDashboardStatsModel = async (user) => {
  const today = new Date().toISOString().split("T")[0];

  // Get the first and last day of the current month
  const date = new Date();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  const firstDayOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString();

  // Filter data based on doctor_id instead of user_id
  const todayAppointmentsResponse = await supabase
    .from("appointments")
    .select("id")
    .eq("date", today)
    .eq("user_id", user.id);
  const newPatientsResponse = await supabase
    .from("patients")
    .select("id")
    .gte("created_at", firstDayOfMonth)
    .lt("created_at", firstDayOfNextMonth)
    .eq("user_id", user.id);
  const presentStaffResponse = await supabase
    .from("staff_attendances")
    .select("id")
    .eq("attendance_status", "Present")
    .eq("user_id", user.id);
  const completedAppointmentsResponse = await supabase
    .from("appointments")
    .select("id")
    .eq("status", "Completed")
    .eq("user_id", user.id);

  // Check if data is null and handle it
  const todayAppointments = todayAppointmentsResponse.data ? todayAppointmentsResponse.data.length : 0;
  const newPatients = newPatientsResponse.data ? newPatientsResponse.data.length : 0;
  const presentStaff = presentStaffResponse.data ? presentStaffResponse.data.length : 0;
  const completedAppointments = completedAppointmentsResponse.data ? completedAppointmentsResponse.data.length : 0;

  return {
    todayAppointments,
    newPatients,
    presentStaff,
    completedAppointments,
  };
};

const getPatientGrowth = async (userId) => {
  const { data, error } = await supabase
    .from('patients')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  // Group data by week of the year
  const weeklyCounts = data.reduce((acc, { created_at }) => {
    // Use date-fns to find the start of the week for the created_at date
    const weekStart = startOfWeek(new Date(created_at), { weekStartsOn: 1 }); // Configured for weeks starting on Monday
    const weekYear = format(weekStart, 'yyyy-wo'); // Format as 'YYYY-W' (ISO week and year)

    acc[weekYear] = (acc[weekYear] || 0) + 1;
    return acc;
  }, {});

  return weeklyCounts;
};

module.exports = { getDashboardStatsModel, getPatientGrowth };
