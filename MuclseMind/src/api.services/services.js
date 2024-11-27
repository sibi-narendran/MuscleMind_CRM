import interceptors from "../interceptors/axios";

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