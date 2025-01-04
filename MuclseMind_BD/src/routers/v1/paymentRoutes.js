const express = require('express');
const { createOrder, verifyPayment } = require('../../controller/paymentController');
const { authenticateJWTUserID } = require('../../middleware/authMiddleware');

const paymentRouter = express.Router();

// Define routes with their respective controller functions
paymentRouter.post('/create-order', authenticateJWTUserID, createOrder);
paymentRouter.post('/verify-payment', authenticateJWTUserID, verifyPayment);

module.exports = paymentRouter;