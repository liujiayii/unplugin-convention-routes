/**
 * 配置解析测试
 */
import { describe, expect, it } from 'vitest'
import { resolveOptions } from '../src/core/options'

describe('resolveOptions', () => {
  it('默认配置 - Vue', () => {
    const options = resolveOptions({ resolver: 'vue' })
    expect(options.resolver).toBe('vue')
    expect(options.dirs).toEqual([{ dir: 'src/pages', baseRoute: '' }])
    expect(options.extensions).toEqual(['vue', 'ts', 'js'])
    expect(options.caseSensitive).toBe(false)
    expect(options.routeNameSeparator).toBe('-')
  })

  it('默认配置 - React', () => {
    const options = resolveOptions({ resolver: 'react' })
    expect(options.resolver).toBe('react')
    expect(options.dirs).toEqual([{ dir: 'src/pages', baseRoute: '' }])
    expect(options.extensions).toEqual(['tsx', 'jsx', 'ts', 'js'])
    expect(options.caseSensitive).toBe(false)
    expect(options.routeNameSeparator).toBe('-')
  })

  it('自定义 dirs - 字符串', () => {
    const options = resolveOptions({
      resolver: 'vue',
      dirs: 'src/views',
    })
    expect(options.dirs).toEqual([{ dir: 'src/views', baseRoute: '' }])
  })

  it('自定义 dirs - 数组', () => {
    const options = resolveOptions({
      resolver: 'vue',
      dirs: [
        { dir: 'src/pages', baseRoute: '' },
        { dir: 'src/admin/pages', baseRoute: 'admin' },
      ],
    })
    expect(options.dirs).toEqual([
      { dir: 'src/pages', baseRoute: '' },
      { dir: 'src/admin/pages', baseRoute: 'admin' },
    ])
  })

  it('自定义 extensions', () => {
    const options = resolveOptions({
      resolver: 'vue',
      extensions: ['vue', 'md'],
    })
    expect(options.extensions).toEqual(['vue', 'md'])
  })

  it('自定义 caseSensitive', () => {
    const options = resolveOptions({
      resolver: 'vue',
      caseSensitive: true,
    })
    expect(options.caseSensitive).toBe(true)
  })

  it('自定义 routeNameSeparator', () => {
    const options = resolveOptions({
      resolver: 'vue',
      routeNameSeparator: '_',
    })
    expect(options.routeNameSeparator).toBe('_')
  })

  it('路径斜杠标准化', () => {
    const options = resolveOptions({
      resolver: 'vue',
      dirs: 'src\\pages',
    })
    // Windows 路径中的反斜杠应该被转换为正斜杠
    expect(options.dirs[0].dir).toBe('src/pages')
  })
})
