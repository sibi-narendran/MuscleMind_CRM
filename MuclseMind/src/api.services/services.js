import interceptors from "../interceptors/axios";
import axios from "axios";

// User authentication services
export const userLogin = async (data) => {
  try {
    const res = await interceptors.post("v1/user/login", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const userRegister = async (data) => {
  try {
    const res = await interceptors.post("v1/user/register", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const otpVerify = async (data) => {
  try {
    const res = await interceptors.post("v1/user/verify-otp", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const sendOtp = async (data) => {
  try {
    const res = await interceptors.post("v1/user/send-otp", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Forgot password services
export const sendPasswordResetOtp = async (data) => {
  try {
    const res = await interceptors.post("v1/user/forgot-password", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resetPassword = async (data) => {
  try {
    const res = await interceptors.post("v1/user/reset-password", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Patient services
export const getPatients = async () => {
  try {
    const res = await interceptors.get("v1/patients/getPatients");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addPatient = async (data) => {
  try {
    const res = await interceptors.post("v1/patients/addPatients", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const editPatient = async (id, data) => {
  try {
    const res = await interceptors.put(`v1/patients/updatePatients/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deletePatient = async (id) => {
  try {
    const res = await interceptors.delete(`v1/patients/deletePatients/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Appointment services
export const getAppointments = async () => {
  try {
    const res = await interceptors.get("v1/appointments/getAppointments");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addAppointment = async (data) => {
  try {
    const res = await interceptors.post("v1/appointments/addAppointment", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAppointment = async (id, data) => {
  try {
    const res = await interceptors.put(`v1/appointments/updateAppointment/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAppointment = async (id) => {
  try {
    const res = await interceptors.delete(`v1/appointments/deleteAppointment/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Clinic Overview & Contact Information
export const addClinic = async (data) => {
  try {
    const res = await interceptors.post("v1/clinics", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getClinics = async () => {
  try {
    const res = await interceptors.get("v1/clinics");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateClinic = async (id, data) => {
  try {
    const res = await interceptors.put(`v1/clinics/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Operating Hours
export const getOperatingHours = async () => {
  try {
    const res = await interceptors.get("v1//operating-hours/operating-hours");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateOperatingHours = async (data) => {
  try {
    const res = await interceptors.put("v1//operating-hours/operating-hours", data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Holidays
export const addHoliday = async (data) => {
  try {
    const res = await interceptors.post("v1/holidays/addHoliday", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getHolidays = async () => {
  try {
    const res = await interceptors.get("v1/holidays/getHolidays");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateHoliday = async (id, data) => {
  try {
    const res = await interceptors.put(`v1/holidays/updateHoliday/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteHoliday = async (id) => {
  try {
    const res = await interceptors.delete(`v1/holidays/deleteHoliday/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Repeat similar functions for Dental Team, Treatment Procedures & Fees, and Medication Preferences

export const getTreatments = async () => {
  try {
    const res = await interceptors.get("v1/treatments/getTreatments");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addTreatment = async (data) => {
  try {
    const res = await interceptors.post("v1/treatments/addTreatment", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const editTreatment = async (id, data) => {
  try {
    const res = await interceptors.put(`v1/treatments/editTreatment/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTreatment = async (id) => {
  try {
    const res = await interceptors.delete(`v1/treatments/deleteTreatment/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMedications = async () => {
  try {
    const res = await interceptors.get("v1/medications/getMedications");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addMedication = async (data) => {
  try {
    const res = await interceptors.post("v1/medications/addMedication", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const editMedication = async (id, data) => {
  try {
    const res = await interceptors.put(`v1/medications/editMedication/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteMedication = async (id) => {
  try {
    const res = await interceptors.delete(`v1/medications/deleteMedication/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Dental Team services
export const getTeamMembers = async () => {
  try {
    const res = await interceptors.get("v1/dental-team/getTeamMembers");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addTeamMember = async (data) => {
  try {
    const res = await interceptors.post("v1/dental-team/addTeamMember", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const editTeamMember = async (id, data) => {
  try {
    const res = await interceptors.put(`v1/dental-team/editTeamMember/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTeamMember = async (id) => {
  try {
    const res = await interceptors.delete(`v1/dental-team/deleteTeamMember/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchAttendances = async (date) => {
  try {
    const res = await interceptors.get(`v1/staff-attendances/attendances/${date}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAttendanceStatus = async (id, status) => {
  try {
    const res = await interceptors.put(`v1/staff-attendances/attendance/${id}`, { status });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getDashboardStats = async () => {
  try {
    const res = await interceptors.get("v1/dashboard/dashboard-stats");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const getDashboardPatientGrowth = async () => {
  try {
    const res = await interceptors.get("v1/dashboard/dashboard-patient-growth");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchEmployeeAttendance = async (dentalTeamId) => {
  console.log("Fetching attendance data for ID:", dentalTeamId);
  try {
    const response = await interceptors.get(`v1/staff-attendances/monthly-attendance/${dentalTeamId}`);
    console.log("API response:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw error;
  }
};