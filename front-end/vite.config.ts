import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import dotenv from 'dotenv'

const backendEnvPath = path.resolve(__dirname, '../backend/.env');
const backendConfig = dotenv.config({ path: backendEnvPath }).parsed;
const BACKEND_PORT = backendConfig?.PORT || 3000;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api' : {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true,
        secure: false,      }
    }
  }
})
