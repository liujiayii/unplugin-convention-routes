import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import Pages from 'unplugin-convention-routes/rspack'

export default defineConfig({
  tools: {
    rspack: {
      plugins: [
        Pages({
          resolver: 'react',
          dirs: 'src/pages',
          extensions: ['tsx', 'jsx'],
        }),
      ],
    },
  },
  plugins: [pluginReact()],
})
