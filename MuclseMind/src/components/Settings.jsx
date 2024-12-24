import React, { useState, useEffect } from 'react';
import { PricingToggle } from '../components/PricingToggle';
import { PricingCard } from '../components/PricingCard';
import { PaymentModal } from '../components/PaymentModal';
import { initializeRazorpay, createOrder, handlePayment } from '../services/payment';
import { Button, message, Modal } from 'antd';
import {AppleFilled, AndroidFilled, GlobalOutlined } from '@ant-design/icons';

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

const Settings = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [platform, setPlatform] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Detect platform
    const detectPlatform = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setPlatform('iOS');
      } else if (/android/.test(userAgent)) {
        setPlatform('Android');
      } else {
        setPlatform('Desktop');
      }
    };

    detectPlatform();

    const   handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    } else {
      setIsInstallable(true); // Show button by default
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const getInstallIcon = () => {
    switch (platform) {
      case 'iOS':
        return <AppleFilled />;
      case 'Android':
        return <AndroidFilled />;
      default:
        return <GlobalOutlined />;
    }
  };

  const getInstructions = () => {
    switch (platform) {
      case 'iOS':
        return [
          '1. Open Safari browser',
          '2. Tap the Share button at the bottom',
          '3. Scroll down and tap "Add to Home Screen"',
          '4. Tap "Add" to confirm'
        ].join('\n');
      case 'Android':
        return [
          '1. Open Chrome browser',
          '2. Tap the three dots menu (⋮)',
          '3. Tap "Add to Home screen"',
          '4. Tap "Add" to confirm'
        ].join('\n');
      default:
        return [
          '1. Open Chrome, Edge, or Firefox',
          '2. Click the install icon in address bar',
          '3. Click "Install" to confirm'
        ].join('\n');
    }
  };

  const handleInstall = () => {
    message.info({
      content: getInstructions(),
      duration: 10,
      style: {
        whiteSpace: 'pre-line',
        marginTop: '20vh'
      }
    });
  };

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
      <Button
        type="primary"
        icon={getInstallIcon()}
        onClick={handleInstall}
        className="bg-meta-5 hover:bg-meta-4 fixed top-4 left-4 z-50"
      >
        Install {platform === 'Desktop' ? 'App' : `for ${platform}`}
      </Button>

      <Modal
        title={`Install Instructions for ${platform}`}
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIsModalVisible(false)}>
            Got it
          </Button>
        ]}
      >
        <div className="py-4">
          <p className="mb-4">Follow these steps to install the app:</p>
          {getInstructions()}
        </div>
      </Modal>

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
