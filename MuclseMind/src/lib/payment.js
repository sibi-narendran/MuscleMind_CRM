import { createPaymentOrder, verifyPayment } from '../interceptor/services';

const RAZORPAY_KEY_ID = 'rzp_test_LP09yDpPnI4V3x';

export async function initializeRazorpay() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function createOrder(planDetails) {
  try {
    const response = await createPaymentOrder({
      amount: planDetails.price,
      planId: planDetails.id || 'basic',
      currency: 'INR'
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to create order');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export function handlePayment(orderDetails, planDetails, userDetails = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderDetails.amount,
      currency: orderDetails.currency,
      name: 'MuclseMind Dental CRM',
      description: `${planDetails.name} Subscription`,
      order_id: orderDetails.id,
      prefill: {
        name: userDetails.name || '',
        email: userDetails.email || '',
        contact: userDetails.phone || ''
      },
      notes: {
        plan_id: planDetails.id,
        plan_name: planDetails.name
      },
      theme: {
        color: '#4F46E5'
      },
      handler: async function(response) {
        try {
          const verificationResult = await verifyPayment({
            orderId: orderDetails.id,
            paymentDetails: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }
          });
          
          if (verificationResult.success) {
            resolve(verificationResult.data);
          } else {
            reject(new Error(verificationResult.message));
          }
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        confirm_close: true,
        ondismiss: function() {
          reject(new Error('Payment cancelled'));
        }
      }
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  });
}