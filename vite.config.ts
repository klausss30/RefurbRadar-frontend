import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Note: Proxy configuration removed - all requests now go through server-side proxy
  // via VITE_API_BASE_URL environment variable (development and production)
})
