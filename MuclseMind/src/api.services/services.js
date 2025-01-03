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

export const editPatient = async (patientId, data) => {
  try {
    const res = await interceptors.put(`v1/patients/updatePatients/${patientId}`, data);
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
    const res = await interceptors.put(
      `v1/appointments/updateAppointment/${id}`,
      data
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAppointment = async (id) => {
  try {
    const res = await interceptors.delete(
      `v1/appointments/deleteAppointment/${id}`
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const getAppointments = async (id) => {
  try {
    const res = await interceptors.get(`v1/appointments/getAppointment/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAppointmentsByDateRange = async (startDate, endDate) => {
  try {
    const response = await interceptors.get(
      `v1/appointments/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const getTodayAppointments = async () => {
  try {
    const response = await interceptors.get("v1/appointments/today");
    return response.data;
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
    const res = await interceptors.get("v1/operating-hours/operating-hours");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateOperatingHours = async (data) => {
  try {
    const res = await interceptors.put("v1/operating-hours/operating-hours", data);
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
    const res = await interceptors.put(
      `v1/treatments/editTreatment/${id}`,
      data
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTreatment = async (id) => {
  try {
    const res = await interceptors.delete(
      `v1/treatments/deleteTreatment/${id}`
    );
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
    const res = await interceptors.put(
      `v1/medications/editMedication/${id}`,
      data
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteMedication = async (id) => {
  try {
    const res = await interceptors.delete(
      `v1/medications/deleteMedication/${id}`
    );
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
    const res = await interceptors.put(
      `v1/dental-team/editTeamMember/${id}`,
      data
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTeamMember = async (id) => {
  try {
    const res = await interceptors.delete(
      `v1/dental-team/deleteTeamMember/${id}`
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchAttendances = async (date) => {
  try {
    const res = await interceptors.get(
      `v1/staff-attendances/attendances/${date}`
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAttendanceStatus = async (id, status) => {
  try {
    const res = await interceptors.put(
      `v1/staff-attendances/attendance/${id}`,
      { status }
    );
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
    const response = await interceptors.get(
      `v1/staff-attendances/monthly-attendance/${dentalTeamId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const res = await interceptors.get("v1/user/profile");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Billing services
export const getBillings = async () => {
  try {
    const res = await interceptors.get("v1/billing/get-billing");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createBilling = async (data) => {
  try {
    const res = await interceptors.post("v1/billing/add-billing", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateBilling = async (id, data) => {
  try {
    const res = await interceptors.put(`v1/billing/update-billing/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};  

export const deleteBilling = async (id) => {
  try {
    const res = await interceptors.delete(`v1/billing/delete-billing/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const generateInvoice = async (id, data) => {
  try {
    const res = await interceptors.put(`v1/ai/generate-invoice/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const GetPrescription = async (id) => {
  try {
    const res = await interceptors.get(`v1/prescription/get-prescription`); // Use .get instead of .delete
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addPrescription = async (data) => {
  try {
    const res = await interceptors.post(
      "v1/prescription/add-prescription",
      data
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updatePrescription = async (id, data) => {
  try {
    const res = await interceptors.put(
      `v1/prescription/update-prescription/${id}`,
      data
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deletePrescriptions = async (id) => {
  try {
    const res = await interceptors.delete(
      `v1/prescription/delete-prescription/${id}`
    ); // Use .get instead of .delete
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const clinicInfo = async () => {
  try {
    const res = await interceptors.get(`v1/clinic/get-clinic`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateClinicInfo = async (id, data) => {
  try {
    const res = await interceptors.put(`v1/clinic/put-clinic/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateImageClinicInfo = async (data) => {
  try {
    const response = await interceptors.put("v1/clinic/put-image-clinic", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Payment related API calls
export const createPaymentOrder = async (data) => {
  try {
    const res = await interceptors.post("v1/payments/create-order", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyPayment = async (data) => {
  try {
    const res = await interceptors.post("v1/payments/verify-payment", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const generatePrescription = async (id, prescriptionData) => {
  try {
    const response = await interceptors.post(
      `/v1/ai/prescription/${id}`, 
      prescriptionData  // Send prescription data in request body
    );
    return response.data;
  } catch (error) {
    console.error('Error in generatePrescription:', error);
    throw error.response?.data || error;
  }
};
