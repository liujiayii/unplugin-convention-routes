import VuePlugin from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Pages from 'unplugin-pages'

const config = defineConfig({
  plugins: [
    VuePlugin(),
    Pages(),
  ],
  build: {
    minify: false,
  },
})

export default config
