import { motion } from 'framer-motion';

const socialLinks = [
  {
    label: 'X (formerly Twitter)',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    href: 'https://twitter.com/dentalaicrm',
  },
  {
    label: 'LinkedIn',
    path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
    href: 'https://www.linkedin.com/company/musclemind-ai/',
  },
  {
    label: 'Gmail',
    path: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
    href: 'mailto:Coolestguy@jeebuddy.in',
  },
];

const SocialLink = ({ social }) => (
  <motion.a
    href={social.href}
    className="text-gray-600 hover:text-indigo-600 relative group"
    aria-label={social.label}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <motion.div
      className="absolute -inset-2 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      initial={false}
      animate={{ scale: [0.8, 1.1, 1], rotate: [0, 10, 0] }}
      transition={{
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 3,
      }}
    />
    <motion.svg
      className="h-6 w-6 drop-shadow-md relative z-10"
      fill="currentColor"
      viewBox="0 0 24 24"
      initial={{ rotate: 0 }}
      whileHover={{
        rotate: [0, -10, 10, -10, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
        },
      }}
    >
      <path d={social.path} />
    </motion.svg>
    <motion.div
      className="absolute -inset-2 bg-indigo-500/10 rounded-full z-0"
      initial={{ scale: 0.8, opacity: 0 }}
      whileHover={{
        scale: 1.2,
        opacity: 1,
        transition: {
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeOut',
        },
      }}
    />
  </motion.a>
);

const Footer = () => {
  return (
    <footer className="relative border-t border-white/20 bg-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center">
          {/* Company Info */}
          <div className="mb-8">
            <span className="text-3xl font-bold text-indigo-600 drop-shadow-sm">
              DentalAI CRM
            </span>
            <p className="mt-4 text-gray-600 max-w-md mx-auto font-medium leading-relaxed">
              Transforming dental practices with AI-powered patient management
              and communication solutions.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-8 mb-8">
            {socialLinks.map((social, index) => (
              <SocialLink key={index} social={social} />
            ))}
          </div>

          {/* Bottom section */}
          <div className="w-full border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-6 mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-600 shadow-md">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-white font-medium text-sm">
                      HIPAA Compliant
                    </span>
                  </div>
                </div>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-300 hover:underline"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-300 hover:underline"
                >
                  Terms of Service
                </a>
              </div>
              <p className="text-gray-500 font-medium">
                &copy; 2024 DentalAI CRM. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
