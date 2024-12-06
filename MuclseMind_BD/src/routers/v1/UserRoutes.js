const express = require('express');
const { registerUserController, sendOtpController, verifyOtpController, loginUserController, forgotPasswordController, resetPasswordController, getUserProfileController } = require('../../controller/UserController.js');
const {authenticateJWT} =require('../../middleware/authMiddleware.js') 
const router = express.Router();

router.post('/register', registerUserController);
router.post('/send-otp', sendOtpController);
router.post('/verify-otp', verifyOtpController);
router.post('/login', loginUserController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.get('/profile', authenticateJWT, getUserProfileController);


module.exports = router;
