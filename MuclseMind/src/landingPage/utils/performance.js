export const measurePerformance = () => {
  if (window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    console.log(
      `Time to First Byte: ${navigation.responseStart - navigation.requestStart}ms`
    );
    console.log(`First Contentful Paint: ${paint[0].startTime}ms`);

    // Report to analytics
    reportPerformanceMetrics({
      ttfb: navigation.responseStart - navigation.requestStart,
      fcp: paint[0].startTime,
    });
  }
};
