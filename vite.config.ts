// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/traffic': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
      '/traffic-events': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
