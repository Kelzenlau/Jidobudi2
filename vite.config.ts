import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    define: {
      // Safely polyfill specific process.env keys without breaking NODE_ENV
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      
      // Global variables
      __firebase_config: JSON.stringify(env.VITE_FIREBASE_CONFIG || ''),
      __app_id: JSON.stringify(env.VITE_APP_ID || 'default-app-id'),
      __initial_auth_token: "undefined"
    }
  }
})