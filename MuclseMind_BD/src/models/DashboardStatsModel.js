const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const { format, startOfMonth, endOfMonth, subMonths } = require('date-fns');

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const getDashboardStatsModel = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const startOfCurrentMonth = startOfMonth(new Date()).toISOString();
    const endOfCurrentMonth = endOfMonth(new Date()).toISOString();
    const startOfLastMonth = startOfMonth(subMonths(new Date(), 1)).toISOString();

    // Today's Appointments
    const { data: todayAppointments, error: aptError } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today);

    // New Patients This Month
    const { data: newPatients, error: patError } = await supabase
      .from("patients")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startOfCurrentMonth)
      .lte("created_at", endOfCurrentMonth);

    // Present Staff Today
    const { data: presentStaff, error: staffError } = await supabase
      .from("staff_attendances")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .eq("attendance_status", "Present");

    // Completed Appointments
    const { data: completedAppointments, error: compAptError } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "Completed")
      .gte("date", startOfCurrentMonth);

    // Last Month's Completed Appointments for comparison
    const { data: lastMonthCompleted } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "Completed")
      .gte("date", startOfLastMonth)
      .lt("date", startOfCurrentMonth);

    // Calculate completion rate
    const completionRate = lastMonthCompleted?.length > 0
      ? ((completedAppointments?.length - lastMonthCompleted.length) / lastMonthCompleted.length) * 100
      : 0;

    // Get appointment statistics
    const { data: appointmentStats, error: statsError } = await supabase
      .from("appointments")
      .select("status")
      .eq("user_id", userId)
      .gte("date", startOfCurrentMonth)
      .lte("date", endOfCurrentMonth);

    if (statsError) throw statsError;

    // Calculate appointment stats
    const appointmentCounts = appointmentStats.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = (acc[curr.status.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        todayAppointments: todayAppointments?.length || 0,
        pendingAppointments: todayAppointments?.filter(apt => apt.status === "Scheduled")?.length || 0,
        newPatients: newPatients?.length || 0,
        presentStaff: presentStaff?.length || 0,
        staffOnLeave: 0, // You might want to add this logic
        completedAppointments: completedAppointments?.length || 0,
        completionRate: Math.round(completionRate * 100) / 100,
        appointmentStats: {
          scheduled: appointmentCounts.scheduled || 0,
          completed: appointmentCounts.completed || 0,
          cancelled: appointmentCounts.cancelled || 0
        }
      }
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    };
  }
};

const getPatientGrowthModel = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const monthlyGrowth = data.reduce((acc, { created_at }) => {
      const monthYear = format(new Date(created_at), 'MMM yyyy');
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        patientGrowth: monthlyGrowth
      }
    };
  } catch (error) {
    console.error("Patient Growth Error:", error);
    return {
      success: false,
      message: "Failed to fetch patient growth data",
      error: error.message
    };
  }
};

const getTodayAppointmentsModel = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_id,
        patient_name,
        treatment_name,
        date,
        time,
        status
      `)
      .eq("user_id", userId)
      .eq("date", today)
      .order("time", { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error("Today's Appointments Error:", error);
    return {
      success: false,
      message: "Failed to fetch today's appointments",
      error: error.message
    };
  }
};

module.exports = {
  getDashboardStatsModel,
  getPatientGrowthModel,
  getTodayAppointmentsModel
};
