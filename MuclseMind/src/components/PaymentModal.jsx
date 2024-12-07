import React from 'react';

export function PaymentModal({ isOpen, onClose, selectedPlan, onInitiatePayment }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-navy-800 rounded-2xl p-8 max-w-md w-full mx-4">
        <h3 className="text-2xl font-bold text-white mb-6">Complete Payment</h3>
        
        <div className="space-y-6">
          <div className="flex justify-between text-gray-300">
            <span>Plan</span>
            <span>{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Amount</span>
            <span>₹{selectedPlan.price}</span>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => onInitiatePayment('upi')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
            >
              Pay with UPI
            </button>
            <button
              onClick={() => onInitiatePayment('card')}
              className="w-full py-3 px-4 bg-navy-700 hover:bg-navy-600 rounded-lg text-gray-300 transition-colors"
            >
              Pay with Card
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}