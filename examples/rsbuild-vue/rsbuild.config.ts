import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'
import Pages from 'unplugin-convention-routes/rspack'

export default defineConfig({
  tools: {
    rspack: {
      plugins: [
        Pages({
          resolver: 'vue',
          dirs: 'src/pages',
          extensions: ['vue'],
        }),
      ],
    },
  },
  plugins: [pluginVue()],
})
