const { createUser, getUserByEmail } = require('../models/UserModels.js');
const { sendEmail } = require('../utils/mail.js');

let otpStore = {}; 
console.log(otpStore,"otpStore");

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
    console.log(`OTP for ${email} stored:`, otpStore[email]); // Log the stored OTP
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
    console.log(`Verifying OTP for ${email}:`, otp, "Stored OTP:", otpStore[email]); // Log OTPs

    // Ensure both OTPs are strings for comparison
    const storedOtp = otpStore[email]?.toString();
    const inputOtp = otp.toString();

    if (storedOtp && storedOtp === inputOtp) {
      console.log(`OTP verified successfully for ${email}`);
      delete otpStore[email]; // Clear OTP after successful verification
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
    return newUser;
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error;
  }
};

module.exports = { sendOtp, verifyOtp, registerUser };
