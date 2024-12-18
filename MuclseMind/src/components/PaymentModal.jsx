import React, { useState } from 'react';
import { initializeRazorpay, createOrder, handlePayment } from '../services/payment';
import { createPaymentOrder } from '../api.services/services';

export function PaymentModal({ isOpen, onClose, selectedPlan, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const taxRate = 0.18;
  const taxAmount = selectedPlan.price * taxRate;
  const totalAmount = selectedPlan.price + taxAmount;

  const handlePayNow = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Load Razorpay SDK
      const isLoaded = await initializeRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // 2. Create order
      const orderDetails = await createOrder({
        ...selectedPlan,
        price: totalAmount
      });

      // 3. Handle payment
      const paymentResult = await handlePayment(orderDetails, selectedPlan, {
        // Add user details if available from your auth context/state
        name: 'Test User',
        email: 'test@example.com',
        phone: '9999999999'
      });

      // 4. Handle success
      onSuccess(paymentResult);
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-2xl font-bold text-black dark:text-white mb-6">Complete Payment</h3>
        
        <div className="space-y-6">
          <div className="flex justify-between text-black dark:text-white">
            <span>Plan</span>
            <span>{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between text-black dark:text-white">
            <span>Subtotal</span>
            <span>₹{selectedPlan.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-black/60 dark:text-white/60 text-sm">
            <span>GST (18%)</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-black dark:text-white font-semibold">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4 pt-4">
            <button
              onClick={handlePayNow}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-meta-5 hover:bg-meta-4 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg text-white transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Pay Now'}
            </button>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}