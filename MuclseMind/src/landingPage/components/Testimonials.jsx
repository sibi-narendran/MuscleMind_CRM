import { motion } from 'framer-motion';
import { memo } from 'react';
import { testimonials } from '../data/testimonials';
import { fadeInUp, staggerContainer } from '../animations/constants';

// Memoized testimonial card component
const TestimonialCard = memo(({ testimonial }) => (
  <motion.div
    className="testimonial-card"
    variants={fadeInUp}
    whileHover={{ y: -5 }}
  >
    <div className="flex items-center mb-4">
      {/* Add loading="lazy" for image optimization */}
      <img
        src={testimonial.image}
        alt={testimonial.name}
        className="w-12 h-12 rounded-full"
        loading="lazy"
      />
      <div className="ml-4">
        <h4 className="font-semibold">{testimonial.name}</h4>
        <p className="text-gray-600">{testimonial.role}</p>
      </div>
    </div>
    <p className="text-gray-600 italic">"{testimonial.quote}"</p>
  </motion.div>
));

TestimonialCard.displayName = 'TestimonialCard';

const Testimonials = () => {
  return (
    <motion.div
      id="testimonials"
      className="py-12 relative bg-gradient-to-t from-transparent via-white/5 to-transparent"
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-50px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-bold text-center text-gray-900 mb-12 mt-12"
          variants={fadeInUp}
        >
          What Dentists Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Testimonials;
