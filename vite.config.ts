import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    // These define global variables to prevent crash if code relies on them, 
    // though for real app functionality you should use environment variables.
    __firebase_config: JSON.stringify(process.env.VITE_FIREBASE_CONFIG || ''),
    __app_id: JSON.stringify(process.env.VITE_APP_ID || 'default-app-id'),
    __initial_auth_token: "undefined"
  }
})