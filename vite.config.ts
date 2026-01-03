import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    define: {
      __firebase_config: JSON.stringify(env.VITE_FIREBASE_CONFIG || ''),
      __app_id: JSON.stringify(env.VITE_APP_ID || 'default-app-id'),
      __initial_auth_token: "undefined"
    }
  }
})
