import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/feed': {
        target: 'https://refurb-tracker.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feed/, '/feeds/nz_in_all.xml'),
        secure: true,
      },
    },
  },
})
