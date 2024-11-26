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

export const resendOtp = async (data) => {
  try {
    const res = await interceptors.post("v1/user/resend-otp", data);
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