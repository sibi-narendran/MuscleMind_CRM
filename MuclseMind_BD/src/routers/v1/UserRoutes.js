const express = require('express');
const { registerUserController, sendOtpController, verifyOtpController, loginUserController, forgotPasswordController, resetPasswordController } = require('../../controller/UserController.js');

const router = express.Router();

router.post('/register', registerUserController);
router.post('/send-otp', sendOtpController);
router.post('/verify-otp', verifyOtpController);
router.post('/login', loginUserController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

module.exports = router;
