const { createUser, getUserByEmail } = require('../models/UserModels.js');
const { sendEmail } = require('../utils/mail.js');

let otpStore = {};

const sendOtpToUser = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  const subject = 'Your OTP Code';
  const text = `Your OTP code is ${otp}. It is valid for 10 minutes.`;

  await sendEmail(email, subject, text);
  return otp;
};

const sendOtp = async (email) => {
  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser && existingUser.length > 0) {
      throw new Error('User already exists');
    }
    const otp = await sendOtpToUser(email);
    otpStore[email] = otp; // Store OTP temporarily
    return otp;
  } catch (error) {
    console.error("Error in sendOtp:", error);
    throw error;
  }
};

const verifyOtp = async (email, otp) => {
  try {
    if (!email) {
      throw new Error('Email is undefined');
    }

    // Ensure both OTPs are strings for comparison
    const storedOtp = otpStore[email]?.toString();
    const inputOtp = otp.toString();

    if (storedOtp && storedOtp === inputOtp) {
      return true;
    }
    throw new Error('Invalid or expired OTP');
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    throw error;
  }
};

const registerUser = async (userData) => {
  try {
    const { email, otp } = userData;
    const isOtpVerified = await verifyOtp(email, otp);
    if (!isOtpVerified) {
      throw new Error('OTP verification failed');
    }

    const newUser = await createUser(userData);
    
    // Delete OTP after successful registration
    delete otpStore[email];

    return newUser;
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    const user = await getUserByEmail(email);
    if (!user || user.length === 0) {
      throw new Error('User not found');
    }

    // Compare plain text passwords
    if (password !== user[0].password) {
      throw new Error('Invalid password');
    }

    return user[0]; // Return user data if login is successful
  } catch (error) {
    console.error("Error in loginUser:", error);
    throw error;
  }
};

module.exports = { sendOtp, verifyOtp, registerUser, loginUser };
