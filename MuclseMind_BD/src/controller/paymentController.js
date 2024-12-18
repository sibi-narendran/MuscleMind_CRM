const paymentService = require('../services/paymentService');
const { createResponse } = require('../utils/responseUtil');

const createOrder = async (req, res) => {
  try {
    const { amount, planId } = req.body;
    const userId = req.user.userId;

    const result = await paymentService.createOrder(amount, userId, planId);
    
    if (!result.success) {
      return res.status(400).json(
        createResponse(false, 'Failed to create order', null, result.error)
      );
    }

    res.status(200).json(
      createResponse(true, 'Order created successfully', result.data)
    );
  } catch (error) {
    console.error('Error in createOrder controller:', error);
    res.status(500).json(
      createResponse(false, 'Failed to create order', null, error.message)
    );
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentDetails } = req.body;
    
    const result = await paymentService.verifyPayment(orderId, paymentDetails);
    
    if (!result.success) {
      return res.status(400).json(
        createResponse(false, 'Payment verification failed', null, result.error)
      );
    }

    res.status(200).json(
      createResponse(true, 'Payment verified successfully', result.data)
    );
  } catch (error) {
    console.error('Error in verifyPayment controller:', error);
    res.status(500).json(
      createResponse(false, 'Payment verification failed', null, error.message)
    );
  }
};

module.exports = {
  createOrder,
  verifyPayment
};