import { motion } from 'framer-motion';
import { toothAnimation, generateSparkles } from '../animations/constants';

export function AnimatedTooth() {
  const sparkles = generateSparkles(8); // Reduced from 15
  const hoverSparkles = generateSparkles(12); // Reduced from 30

  return (
    <motion.div
      className="w-full max-w-md mx-auto my-8"
      animate="float"
      variants={toothAnimation}
      whileHover={{ scale: 1.05 }}
    >
      <motion.svg
        viewBox="0 0 368.72 368.72"
        className="w-16 h-16 mx-auto text-indigo-600 relative"
        fill="currentColor"
      >
        {/* Optimized Sparkles */}
        <SparkleEffects sparkles={sparkles} />
        <HoverSparkles sparkles={hoverSparkles} />
        <ToothPaths />
        <GlowEffect />
        <GradientDefs />
      </motion.svg>
    </motion.div>
  );
}

// Optimized sparkle animation
const SparkleEffects = ({ sparkles }) => (
  <>
    {sparkles.map((sparkle) => (
      <motion.circle
        key={sparkle.id}
        cx={sparkle.cx}
        cy={sparkle.cy}
        r={sparkle.size / 1.5}
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 2,
          delay: sparkle.delay,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />
    ))}
  </>
);

// Simplified hover sparkles
const HoverSparkles = ({ sparkles }) => (
  <>
    {sparkles.map((sparkle) => (
      <motion.circle
        key={`hover-${sparkle.id}`}
        cx={sparkle.cx}
        cy={sparkle.cy}
        r={sparkle.size / 1.5}
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{
          scale: [0, 1, 0],
          opacity: [0, 0.7, 0],
        }}
      />
    ))}
  </>
);

const ToothPaths = () => (
  <>
    <motion.path
      d="M336.163,88.732c-33.892-39.539-91.613-8.697-99.793-4.02c-26.305-17.968-63.049-33.787-92.636-11.235
      c-21.262,16.196-33.491,37.087-36.396,62.108c-4.369,37.679,14.349,74.271,24.08,86.076c4.938,5.984,6.651,35.112,7.912,56.387
      c2.678,45.301,4.984,84.42,28.141,89.324c5.92,1.266,11.572,0.221,16.382-2.975c12.467-8.308,16.395-29.163,20.937-53.295
      c5.845-31.057,11.201-54.736,25.051-53.783c4.171,0.291,5.925,1.824,6.994,3.125c7.029,8.506,3.974,33.811,1.742,52.297
      c-3.229,26.826-6.018,49.994,11.643,55.142c1.592,0.465,3.544,0.837,5.786,0.837c3.556,0,7.819-0.906,12.501-3.73
      c27.119-16.312,48.45-86.721,56.688-124.761c21.576-16.801,35.67-41.339,38.842-67.882
      C366.464,151.886,363.618,120.759,336.163,88.732z"
    />
    <motion.path
      d="M344.97,170.075c-2.684,22.471-15.093,43.164-34.02,56.838c-1.94,1.395-3.311,3.498-3.775,5.833
      c-11.235,54.491-33.021,106.427-48.566,115.792c-0.697,0.418-1.58,0.859-2.324,0.952c-2.184-5.065,0.023-23.33,1.371-34.461
      c3.079-25.526,6.251-51.958-6.018-66.808c-4.927-5.972-11.991-9.457-20.449-10.038c-0.86-0.069-1.708-0.093-2.545-0.093
      c-29.639,0-36.877,38.423-42.722,69.479c-2.939,15.615-6.96,37.017-12.717,40.862c-0.284,0.221-0.61,0.407-1.749,0.175
      c-8.841-1.858-11.734-50.785-12.972-71.664c-2.068-35.123-3.771-57.187-12.264-67.481c-6.582-7.971-23.51-39.805-19.821-71.652
      c2.271-19.629,12.014-36.134,28.959-49.054c37.453-28.576,100.438,37.122,101.077,37.784"
    />
  </>
);

const GlowEffect = () => (
  <motion.circle
    cx="184"
    cy="184"
    r="160"
    fill="url(#glow)"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 0.2, 0] }}
    transition={{
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse',
    }}
  />
);

const GradientDefs = () => (
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
    </radialGradient>
  </defs>
);
