import React, { useState } from 'react';
import { PricingToggle } from '../components/PricingToggle';
import { PricingCard } from '../components/PricingCard';
import { PaymentModal } from '../components/PaymentModal';
import { initializeRazorpay, createOrder, handlePayment } from '../services/payment';

const pricingTiers = [
  {
    id: 'basic-plan',
    name: 'Basic Plan',
    price: 1499,
    description: 'Essential features for dental practice management',
    features: [
      'Patient records management',
      'Basic appointment scheduling',
      'Digital prescriptions',
      'Treatment planning',
      'Basic reporting',
      'Email support'
    ]
  },
  {
    id: 'ai-powered',
    name: 'AI-Powered CRM',
    price: 2499,
    popular: true,
    description: 'Advanced AI-powered features for intelligent practice management',
    features: [
      'All Basic Plan features',
      'AI-powered patient insights',
      'Smart appointment scheduling',
      'Automated follow-ups',
      'Treatment success prediction',
      'AI-driven revenue forecasting',
      'Intelligent patient segmentation',
      '24/7 priority support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise AI (Coming Soon)',
    price: null,
    description: 'Next-generation AI features including voice capabilities',
    comingSoon: true,
    features: [
      'All AI-Powered CRM features',
      'AI voice assistant integration',
      'Automated patient calls',
      'Voice-based patient records',
      'Real-time voice analytics',
      'Multilingual voice support',
      'Custom AI model training'
    ]
  }
];

const Settings =()=> {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePlanSelection = (plan) => {
    if (plan.comingSoon) {
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentInitiation = async (paymentMethod) => {
    const razorpayLoaded = await initializeRazorpay();
    
    if (!razorpayLoaded) {
      alert('Razorpay SDK failed to load');
      return;
    }

    const orderDetails = await createOrder(selectedPlan);
    handlePayment(orderDetails, selectedPlan);
    setShowPaymentModal(false);
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl text-black dark:text-white font-bold mb-6">
            Transform Your Dental Practice<br />with AI-Powered CRM
          </h1>
          <p className="text-black dark:text-white max-w-2xl mx-auto">
            Choose the perfect plan for your practice. From essential management tools to advanced AI capabilities, 
            we're revolutionizing dental practice management.
          </p>
        </div>

        <PricingToggle isAnnual={isAnnual} onToggle={() => setIsAnnual(!isAnnual)} />

        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.name}
              tier={tier}
              isAnnual={isAnnual}
              onSelectPlan={handlePlanSelection}
            />
          ))}
        </div>

        {showPaymentModal && selectedPlan && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            selectedPlan={selectedPlan}
            onInitiatePayment={handlePaymentInitiation}
          />
        )}
      </div>
    </div>
  );
}

export default Settings;
