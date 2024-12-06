require('dotenv').config();
const { registerUser, sendOtp, verifyOtp, loginUser, sendPasswordResetOtp, resetPassword } = require('../services/UserService.js');
const { createResponse } = require('../utils/responseUtil.js');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const sendOtpController = async (req, res) => {
  const { email } = req.body;
  try {
    await sendOtp(email);
    res.status(200).json(createResponse(true, 'OTP sent successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to send OTP', null, error.message));
  }
};

const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.status(400).json(createResponse(false, 'Email is required'));
    }

    const isVerified = await verifyOtp(email, otp);
    if (isVerified) {
      res.status(200).json(createResponse(true, 'OTP verified successfully'));
    } else {
      res.status(400).json(createResponse(false, 'OTP verification failed'));
    }
  } catch (error) {
    console.error("Error in verifyOtpController:", error);
    res.status(500).json(createResponse(false, 'Internal Server Error', null, error.message));
  }
};

const registerUserController = async (req, res) => {
  const { username, email, phoneNumber, password, otp } = req.body;
  try {
    const userData = { username, email, phoneNumber, password, otp, clinicName };
    const newUser = await registerUser(userData);
    
    res.json(createResponse(true, 'User registered successfully', newUser, null, 201));
  } catch (error) {
    res.json(createResponse(false, 'Failed to register user', null, error.message, 500));
  }
};

const loginUserController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await loginUser(email, password);
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15d' });

    res.status(200).json(createResponse(true, 'Login successful', { user, token }));
  } catch (error) {
    res.status(401).json(createResponse(false, 'Login failed', null, error.message));
  }
};

const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  try {
    await sendPasswordResetOtp(email);
    res.status(200).json(createResponse(true, 'Password reset OTP sent successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to send password reset OTP', null, error.message));
  }
};

const resetPasswordController = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    await resetPassword(email, otp, newPassword);
    res.status(200).json(createResponse(true, 'Password reset successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to reset password', null, error.message));
  }
};

module.exports = { sendOtpController, verifyOtpController, registerUserController, loginUserController, forgotPasswordController, resetPasswordController };
