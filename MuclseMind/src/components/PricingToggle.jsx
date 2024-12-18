import React from 'react';

export function PricingToggle({ isAnnual, onToggle }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={`text-sm ${!isAnnual ? 'text-black dark:text-white font-medium' : 'text-black/60 dark:text-white/60'}`}>
        Monthly
      </span>
      <button
        onClick={onToggle}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-meta-5 dark:bg-indigo-600 transition-colors"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
            isAnnual ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm ${isAnnual ? 'text-black dark:text-white font-medium' : 'text-black/60 dark:text-white/60'}`}>
        Annually <span className="text-meta-5 dark:text-indigo-400 ml-1">20% off</span>
      </span>
    </div>
  );
}