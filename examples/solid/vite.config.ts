import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import pages from 'unplugin-convention-routes'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solid(),
    pages({
      dirs: [
        { dir: resolve(__dirname, './src/pages'), baseRoute: '' },
        { dir: 'src/features/**/pages', baseRoute: 'features' },
        { dir: 'src/admin/pages', baseRoute: 'admin' },
      ],
      extensions: ['tsx', 'md'],
    }),
  ],
  build: {
    target: 'esnext',
  },
})
