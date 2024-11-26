const express = require('express');
const { registerUserController, sendOtpController, verifyOtpController, loginUserController } = require('../../controller/UserController.js');

const router = express.Router();

router.post('/register', registerUserController);
router.post('/send-otp', sendOtpController);
router.post('/verify-otp', verifyOtpController);
router.post('/login', loginUserController);

module.exports = router;
