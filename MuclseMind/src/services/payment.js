const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_HERE'; // Replace with your actual test key

export async function initializeRazorpay() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function createPaymentOrder(planDetails) {
  // In production, this should make a call to your backend
  // which would create a Razorpay order and return the order details
  const amount = planDetails.price * 100; // Convert to paise
  
  try {
    // Simulate API call to your backend
    return {
      id: 'order_' + Math.random().toString(36).substr(2, 9),
      amount: amount,
      currency: 'INR',
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export function handlePayment(orderDetails, planDetails) {
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: orderDetails.amount,
    currency: orderDetails.currency,
    name: 'DentalCRM Pro',
    description: `${planDetails.name} Plan Subscription`,
    order_id: orderDetails.id,
    handler: function (response) {
      console.log('Payment successful:', response);
      // Handle successful payment - In production, verify payment on backend
      alert('Payment successful! Your subscription has been activated.');
    },
    prefill: {
      name: '',
      email: '',
      contact: ''
    },
    theme: {
      color: '#4F46E5'
    },
    modal: {
      ondismiss: function() {
        console.log('Payment modal closed');
      }
    }
  };

  const razorpayInstance = new window.Razorpay(options);
  razorpayInstance.open();
}