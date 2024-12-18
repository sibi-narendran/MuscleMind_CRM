const express = require('express');
const controller = require('../../controller/paymentController');
const { authenticateJWTUserID } = require('../../middleware/authMiddleware');
const paymentRouter = express.Router();

paymentRouter.post('/create-order', authenticateJWTUserID, controller.createOrder);
paymentRouter.post('/verify-payment', authenticateJWTUserID, controller.verifyPayment);

module.exports = paymentRouter;