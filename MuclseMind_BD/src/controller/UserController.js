const { registerUser, sendOtp, verifyOtp } = require('../services/UserService.js');
const { createResponse } = require('../utils/responseUtil.js');

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
    console.log("Received email:", email);
    console.log("Received OTP:", otp);

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
  const { username, email, phoneNumber, password } = req.body;
  try {
    const userData = { username, email, phoneNumber, password, otp };
    const newUser = await registerUser(userData);
    res.status(201).json(createResponse(true, 'User registered successfully', newUser));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to register user', null, error.message));
  }
};

module.exports = { sendOtpController, verifyOtpController, registerUserController };
