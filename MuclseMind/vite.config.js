import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    host: '0.0.0.0', // Allows access from any IP address
  },
  
  server: {
    host: '0.0.0.0' // Listen on all network interfaces
  }
});