export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const toothAnimation = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

export const generateSparkles = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    cx: 40 + Math.random() * 280,
    cy: 40 + Math.random() * 280,
    delay: Math.random() * 1.5,
    size: 4 + Math.random() * 6,
  }));
};
