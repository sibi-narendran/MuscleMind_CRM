export const registerPWA = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        import.meta.env.MODE === 'development' ? '/dev-sw.js' : '/sw.js',
        { type: import.meta.env.MODE === 'development' ? 'module' : 'classic' }
      );
      console.log('SW registered:', registration);
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  }
}; 