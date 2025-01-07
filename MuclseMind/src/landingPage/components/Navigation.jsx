import { motion } from 'framer-motion';
import { memo, useCallback } from 'react';

// Move navLinks outside component to prevent recreation on each render
const navLinks = [
  { href: '#features', text: 'Features' },
  { href: '#demo', text: 'Demo' },
  { href: '#testimonials', text: 'Testimonials' },
  { href: '#pricing', text: 'Pricing' },
];

// Memoize NavLink component since it's used in a map
const NavLink = memo(
  ({ href, text, isMobile, handleScroll, setIsMenuOpen }) => {
    const baseClasses =
      'text-gray-700 hover:text-indigo-600 font- transition-colors duration-300';
    const mobileClasses =
      'block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-50';

    return (
      <a
        href={href}
        className={isMobile ? `${baseClasses} ${mobileClasses}` : baseClasses}
        onClick={(e) => {
          e.preventDefault();
          handleScroll(href.slice(1));
          // Close mobile menu after clicking a link (mobile only)
          if (isMobile) {
            setIsMenuOpen(false);
          }
        }}
      >
        {text}
      </a>
    );
  }
);

export function Navigation({ isMenuOpen, setIsMenuOpen, handleScroll }) {
  // Memoize the toggle handler
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen, setIsMenuOpen]);

  // Memoize the trial button handler
  const handleTrialClick = useCallback(() => {
    window.location.href = '/login';
  }, []);

  return (
    <motion.nav
      className="backdrop-blur-lg bg-white/20 shadow-lg fixed w-full z-10 border-b border-white/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 50 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">
              GrowdentCRM
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} handleScroll={handleScroll} />
            ))}
            <button
              onClick={() =>
                (window.location.href = 'https://www.growdentcrm/')
              }
              className="text-indigo-600 border border-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-300"
            >
              Log In
            </button>
            <button
              onClick={handleTrialClick}
               className= " bg-purple-500 text-white border border-indigo-600 px-4 py-2 rounded-lg hover:bg-purple-900 transition-colors duration-300"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <motion.div
        className="md:hidden"
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          height: isMenuOpen ? 'auto' : 0,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
      >
        {isMenuOpen && (
          <div className="px-4 pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-lg">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                isMobile
                handleScroll={handleScroll}
                setIsMenuOpen={setIsMenuOpen}
              />
            ))}
            <div className="px-3 py-2 space-y-2">
              <button
                onClick={() =>
                  (window.location.href = import.meta.env.VITE_LOGIN_URL)
                }
                className="w-full text-indigo-600 border border-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-300"
              >
                Log In
              </button>
              <button
                onClick={handleTrialClick}
                className="w-full text-emerald-600 font-medium border border-emerald-300 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors duration-300"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.nav>
  );
}
