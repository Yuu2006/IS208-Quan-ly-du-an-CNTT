import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    allowedHosts: true,
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
})
//npx ngrok http 5174
