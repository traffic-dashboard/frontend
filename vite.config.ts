// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // axios.get('/traffic/average-stats') 요청을
      // http://127.0.0.1:8000/traffic/average-stats 로 프록시
      '/traffic': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
