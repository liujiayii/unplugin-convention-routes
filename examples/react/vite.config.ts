import react from '@vitejs/plugin-react'
import Pages from 'unplugin-pages/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Pages({
      resolver: 'react',
    }),
  ],
})
