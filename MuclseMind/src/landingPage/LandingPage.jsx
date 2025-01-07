import { motion } from 'framer-motion';
import './land.css'
import { useState, Suspense, lazy } from 'react';
import { Navigation } from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import Demo from './components/Demo';
const Features = lazy(
  () => import('./components/Features' /* webpackChunkName: "features" */)
);
const Testimonials = lazy(
  () =>
    import('./components/Testimonials' /* webpackChunkName: "testimonials" */)
);
const Pricing = lazy(
  () => import('./components/Pricing' /* webpackChunkName: "pricing" */)
);
const Footer = lazy(
  () => import('./components/Footer' /* webpackChunkName: "footer" */)
);
const SkeletonLoader = lazy(() => import('./components/SkeletonLoader'));

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (elementId) => {
    const element = document.getElementById(elementId);
    const offset = 80;
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.div
      className="min-h-screen bg-[#8EC5FC]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: `
        linear-gradient(to bottom right,
        #8EC5FC 0%,
        #8EC5FC 33.33%,
        #B4CCFD 33.33%,
        #B4CCFD 66.66%,
        #E0C3FC 66.66%,
        #E0C3FC 100%
      )`,
      }}
    >
      <Navigation
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        handleScroll={handleScroll}
      />
      {/* Add a subtle medical-themed pattern overlay */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Hero Section - softer gradient overlay */}
      <div className="relative">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(at 100% 100%, rgba(224, 195, 252, 0.3) 0, transparent 50%),
              radial-gradient(at 0% 0%, rgba(142, 197, 252, 0.3) 0, transparent 50%)
            `,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl "
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.span className="block text-black pb-5">
                Transform Your Dental Practice
              </motion.span>
              <motion.span
                className="block text-indigo-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                With AI-Powered CRM
              </motion.span>
            </motion.h1>
            <motion.p
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Let AI handle your patient communications, appointments, and
              practice growth while you focus on providing excellent dental
              care.
            </motion.p>
            <motion.div
              className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            ></motion.div>
          </motion.div>
        </div>
      </div>

      <ErrorBoundary>
        <Suspense>
          <Features />
          <Demo />
          <Testimonials />
          <Pricing />
          <Footer />
        </Suspense>
      </ErrorBoundary>
    </motion.div>
  );
}

export default LandingPage;
