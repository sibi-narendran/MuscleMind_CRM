import { motion } from 'framer-motion';
import { memo } from 'react';
import { features } from '../data/features';
import { FeatureIcon } from './FeatureIcon';
import { fadeInUp, staggerContainer } from '../animations/constants';

// Memoize individual feature card to prevent unnecessary re-renders
const FeatureCard = memo(({ feature, index }) => (
  <motion.div
    className="feature-card relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center"
    variants={fadeInUp}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
  >
    <FeatureIcon path={feature.icon.path} viewBox={feature.icon.viewBox} />
    <h3 className="text-lg font-medium text-gray-900 mt-4">{feature.title}</h3>
    <p className="mt-2 text-center text-gray-500">{feature.description}</p>
  </motion.div>
));

FeatureCard.displayName = 'FeatureCard';

const Features = () => {
  return (
    <motion.div
      id="features"
      className="py-12 relative bg-gradient-to-b from-transparent via-white/5 to-transparent"
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center" variants={fadeInUp}>
          <h2 className="text-3xl font-medium text-black mt-1">
            Powerful Features
          </h2>
        </motion.div>
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Export memoized version of the component
export default memo(Features);
