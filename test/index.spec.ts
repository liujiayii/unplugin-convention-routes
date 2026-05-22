import { describe, expect, it } from 'vitest'
import { unpluginFactory } from '../src'

describe('unpluginFactory', () => {
  it('only applies the load hook to virtual modules', () => {
    const plugin = unpluginFactory(
      {
        resolver: 'react',
      },
      {
        framework: 'rspack',
      },
    ) as any

    expect(plugin.load.filter.id).toBeInstanceOf(RegExp)
    expect(plugin.load.filter.id.test('virtual:unplugin-convention-routes/react')).toBe(true)
    expect(plugin.load.filter.id.test('~react-pages')).toBe(true)
    expect(plugin.load.filter.id.test('/node_modules/pkg/i18n/en.json')).toBe(false)
  })

  it('normalizes route aliases to the canonical virtual module id', async () => {
    const plugin = unpluginFactory(
      {
        resolver: 'vue',
      },
      {
        framework: 'rspack',
      },
    ) as any

    expect(plugin.resolveId.handler('~pages')).toBe(
      'virtual:unplugin-convention-routes/vue',
    )
  })
})
