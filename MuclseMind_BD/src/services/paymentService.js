const Razorpay = require('razorpay');
const crypto = require('crypto');
const paymentModel = require('../models/paymentModel');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (amount, userId, planId, isAnnual) => {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR'
    });

    const paymentRecord = await paymentModel.createPaymentRecord({
      user_id: userId,
      order_id: order.id,
      amount: amount * 100,
      plan_id: planId,
      is_annual: isAnnual,
      status: 'pending'
    });

    if (paymentRecord.error) throw new Error(paymentRecord.error);

    return { success: true, data: order };
  } catch (error) {
    console.error('Error in createOrder service:', error);
    return { success: false, error: error.message };
  }
};

const verifyPayment = async (orderId, paymentDetails, userId) => {
  try {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${orderId}|${paymentDetails.razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== paymentDetails.razorpay_signature) {
      throw new Error('Invalid signature');
    }

    const result = await paymentModel.updatePaymentStatus(orderId, paymentDetails);
    if (result.error) throw new Error(result.error);

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in verifyPayment service:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createOrder,
  verifyPayment
};