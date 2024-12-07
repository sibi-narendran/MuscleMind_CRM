import React from 'react';

export function PricingCard({ tier, isAnnual, onSelectPlan }) {
  const isPopular = tier.popular;
  const isComingSoon = tier.comingSoon;
  const finalPrice = isAnnual && tier.price ? Math.floor(tier.price * 0.8) : tier.price;

  return (
    <div 
      className={`rounded-2xl p-8 transition-transform duration-300 hover:scale-105 ${
        isPopular ? 'bg-indigo-900/50 ring-2 ring-indigo-600' : 'bg-navy-800/50'
      }`}
    >
      {isPopular && (
        <span className="inline-block px-4 py-1 text-sm font-semibold text-indigo-200 bg-indigo-800 rounded-full mb-4">
          Most Popular
        </span>
      )}
      
      <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
      <p className="text-sm text-gray-400 mb-6">{tier.description}</p>
      
      {!isComingSoon && (
        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-bold text-white">₹{finalPrice}</span>
          <span className="text-gray-400 ml-2">/ month</span>
        </div>
      )}
      
      {!isComingSoon && tier.addOnPrice && (
        <p className="text-sm text-gray-400 mb-6">
          + ₹{tier.addOnPrice} / additional staff per month
        </p>
      )}

      <button
        onClick={() => onSelectPlan(tier)}
        disabled={isComingSoon}
        className={`w-full py-3 px-4 rounded-lg mb-8 transition-colors ${
          isComingSoon
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : isPopular
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-navy-700 hover:bg-navy-600 text-gray-300'
        }`}
      >
        {isComingSoon ? 'Coming Soon' : isPopular ? 'Get Started' : 'Choose Plan'}
      </button>

      <ul className="space-y-4">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start text-gray-300">
            <svg className="w-5 h-5 text-indigo-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}