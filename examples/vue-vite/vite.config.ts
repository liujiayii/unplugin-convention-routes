import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Pages from 'unplugin-convention-routes/vite'

const config = defineConfig({
  plugins: [
    Vue(),
    Pages({
      resolver: 'vue',
      dirs: 'src/pages',
      extensions: ['vue'],
    }),
  ],
})

export default config
