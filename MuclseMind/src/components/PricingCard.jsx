import React from 'react';

export function PricingCard({ tier, isAnnual, onSelectPlan }) {
  const isPopular = tier.popular;
  const isComingSoon = tier.comingSoon;
  const finalPrice = isAnnual && tier.price ? Math.floor(tier.price * 0.8) : tier.price;

  return (
    <div 
      className={`rounded-2xl p-8 transition-transform duration-300 hover:scale-105 ${
        isPopular 
          ? 'bg-meta-5/10 dark:bg-indigo-900/50 ring-2 ring-meta-5 dark:ring-indigo-600' 
          : 'bg-gray-50 dark:bg-navy-800/50'
      }`}
    >
      {isPopular && (
        <span className="inline-block px-4 py-1 text-sm font-semibold text-meta-5 bg-meta-5/10 dark:text-white dark:bg-indigo-800 rounded-full mb-4">
          Most Popular
        </span>
      )}
      
      <h3 className="text-xl font-semibold text-black dark:text-white mb-2">{tier.name}</h3>
      <p className="text-sm text-black dark:text-white mb-6">{tier.description}</p>
      
      {!isComingSoon && (
        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-bold text-black dark:text-white">₹{finalPrice}</span>
          <span className="text-black dark:text-white ml-2">/ month</span>
        </div>
      )}
      
      
      <button
        onClick={() => onSelectPlan(tier)}
        disabled={isComingSoon}
        className={`w-full py-3 px-4 rounded-lg mb-8 transition-colors ${
          isComingSoon
            ? ' text-black dark:text-yellow-500 cursor-not-allowed'
            : isPopular
              ? 'bg-meta-5 hover:bg-meta-4 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-navy-700 dark:hover:bg-navy-600 text-black dark:text-white'
        }`}
      >
        {isComingSoon ? 'Coming Soon' : isPopular ? 'Get Started' : 'Choose Plan'}
      </button>

      <ul className="space-y-4">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start text-black dark:text-white">
            <svg className="w-5 h-5 text-meta-5 dark:text-indigo-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}