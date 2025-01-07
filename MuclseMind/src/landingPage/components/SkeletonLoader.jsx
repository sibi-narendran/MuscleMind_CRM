import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'default' }) => {
  const shimmerVariants = {
    initial: {
      x: '-100%',
    },
    animate: {
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear',
      },
    },
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'features':
        return (
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative bg-white/5 p-6 rounded-xl overflow-hidden"
                >
                  <div className="h-12 w-12 rounded-lg bg-gray-200 mb-4" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="relative bg-white/5 p-6 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200" />
                    <div className="ml-4">
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative bg-white/5 p-6 rounded-xl overflow-hidden"
                >
                  <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
                  <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 w-full bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-64 bg-white/5 rounded-xl overflow-hidden">
            <div className="h-full w-full bg-gray-200" />
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {renderSkeleton()}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      />
    </div>
  );
};

export default SkeletonLoader;
