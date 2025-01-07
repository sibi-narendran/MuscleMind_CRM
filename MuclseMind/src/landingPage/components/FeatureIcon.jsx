export const FeatureIcon = ({
  path,
  viewBox = '0 0 24 24',
  className = 'w-16 h-16 text-indigo-600',
}) => (
  <svg
    className={className}
    fill="none"
    viewBox={viewBox}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d={path}
    />
  </svg>
);
