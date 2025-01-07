import { motion } from 'framer-motion';
import { memo } from 'react';
import { pricingPlans } from '../data/pricingPlans';

// Memoized button component
const PricingButton = memo(
  ({ isComingSoon, highlighted, buttonText, plan, handlePlanSelection }) => (
    <button
      onClick={() => handlePlanSelection(plan)}
      disabled={isComingSoon}
      className={`w-full py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-200 
      ${highlighted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
      ${isComingSoon ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      {buttonText}
    </button>
  )
);

PricingButton.displayName = 'PricingButton';

// Memoized pricing card component
const PricingCard = memo(({ plan, index }) => {
  const isBasicPlan = plan.name.toLowerCase().includes('basic');

  const handlePlanSelection = (selectedPlan) => {
    try {
      localStorage.setItem(
        'selectedPlan',
        JSON.stringify({
          name: selectedPlan.name,
          price: selectedPlan.price,
          duration: selectedPlan.duration,
          features: selectedPlan.features,
        })
      );

      const isFreeTrial = selectedPlan.buttonText
        .toLowerCase()
        .includes('free trial');
      localStorage.setItem('isFreeTrial', JSON.stringify(isFreeTrial));

      window.location.href = `/login`;
    } catch (error) {
      console.error('Error storing plan details:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.2,
      }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.2 },
      }}
      className={`bg-white p-8 rounded-xl shadow-lg relative 
        ${plan.highlighted ? 'border-2 border-blue-500' : ''}
        ${isBasicPlan ? '-mt-8 md:-mt-12' : ''}`}
    >
      {plan.tag && (
        <span className="absolute -top-3 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          {plan.tag}
        </span>
      )}
      <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold">{plan.price}</span>
        {plan.duration && (
          <span className="text-gray-500 ml-2">{plan.duration}</span>
        )}
      </div>
      <p className="text-gray-600 mb-6">{plan.description}</p>
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <PricingButton
        isComingSoon={plan.isComingSoon}
        highlighted={plan.highlighted}
        buttonText={plan.buttonText}
        plan={plan}
        handlePlanSelection={handlePlanSelection}
      />
    </motion.div>
  );
});

PricingCard.displayName = 'PricingCard';

function Pricing() {
  return (
    <motion.section
      id="pricing"
      className="py-20 px-4"
      initial={{ opacity: 0, y: -30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that best fits your needs
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default memo(Pricing);
