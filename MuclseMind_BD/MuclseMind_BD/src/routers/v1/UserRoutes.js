const express = require('express');
const { registerUserController, sendOtpController, verifyOtpController } = require('../../controller/UserController.js');

const router = express.Router();

router.post('/register', registerUserController);
router.post('/send-otp', sendOtpController);
router.post('/verify-otp', verifyOtpController);

module.exports = router;
