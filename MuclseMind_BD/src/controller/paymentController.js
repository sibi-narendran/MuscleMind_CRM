const paymentService = require('../services/paymentService');
const { createResponse } = require('../utils/responseUtil');

// Create order controller
const createOrder = async (req, res) => {
  try {
    const { amount, planId, isAnnual } = req.body;
    const userId = req.user.userId;

    const result = await paymentService.createOrder(amount, userId, planId, isAnnual);
    
    if (!result.success) {
      return res.status(400).json(
        createResponse(false, 'Failed to create order', null, result.error)
      );
    }

    res.status(200).json(
      createResponse(true, 'Order created successfully', result.data)
    );
  } catch (error) {
    res.status(500).json(
      createResponse(false, 'Failed to create order', null, error.message)
    );
  }
};

// Verify payment controller
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentDetails } = req.body;
    const userId = req.user.userId;

    const result = await paymentService.verifyPayment(orderId, paymentDetails, userId);
    
    if (!result.success) {
      return res.status(400).json(
        createResponse(false, 'Payment verification failed', null, result.error)
      );
    }

    res.status(200).json(
      createResponse(true, 'Payment verified successfully', result.data)
    );
  } catch (error) {
    res.status(500).json(
      createResponse(false, 'Payment verification failed', null, error.message)
    );
  }
};

// Make sure to export all controller functions
module.exports = {
  createOrder,
  verifyPayment
};