/**
 * 路由生成测试
 */
import { describe, expect, it } from 'vitest'
import type { ResolvedOptions } from '../src/core/types'
import { generateReactRoutes, generateVueRoutes } from '../src/resolvers'

/**
 * 创建测试用的配置选项
 */
function createTestOptions(overrides: Partial<ResolvedOptions> = {}): ResolvedOptions {
  return {
    root: '/project',
    resolver: 'vue',
    dirs: [{ dir: 'src/pages', baseRoute: '' }],
    extensions: ['vue'],
    exclude: [],
    importPath: 'relative',
    caseSensitive: false,
    routeNameSeparator: '-',
    ...overrides,
  }
}

describe('generateVueRoutes - Vite', () => {
  it('生成基本的路由代码', () => {
    const options = createTestOptions({ resolver: 'vue' })
    const code = generateVueRoutes(options, 'vite')

    // 检查是否包含 import.meta.glob
    expect(code).toContain('import.meta.glob')
    // 检查是否包含正确的目录路径
    expect(code).toContain('/src/pages')
    // 检查是否导出 routes
    expect(code).toContain('export default routes')
  })

  it('生成多目录路由代码', () => {
    const options = createTestOptions({
      resolver: 'vue',
      dirs: [
        { dir: 'src/pages', baseRoute: '' },
        { dir: 'src/admin/pages', baseRoute: 'admin' },
      ],
    })
    const code = generateVueRoutes(options, 'vite')

    // 检查是否包含两个 glob
    expect(code).toContain('__pages_0__')
    expect(code).toContain('__pages_1__')
    // 检查是否包含 baseRoute
    expect(code).toContain("routePath = '/admin' + routePath")
  })

  it('生成自定义扩展名的路由代码', () => {
    const options = createTestOptions({
      resolver: 'vue',
      extensions: ['vue', 'md', 'jsx'],
    })
    const code = generateVueRoutes(options, 'vite')

    // 检查是否包含多个扩展名
    expect(code).toContain('{vue,md,jsx}')
  })
})

describe('generateVueRoutes - Rspack', () => {
  it('生成基本的路由代码', () => {
    const options = createTestOptions({ resolver: 'vue' })
    const code = generateVueRoutes(options, 'rspack')

    // 检查是否包含 import.meta.webpackContext
    expect(code).toContain('import.meta.webpackContext')
    // 检查是否使用绝对路径
    expect(code).toContain('/project/src/pages')
    // 检查是否导出 routes
    expect(code).toContain('export default routes')
  })
})

describe('generateReactRoutes - Vite', () => {
  it('生成基本的路由代码', () => {
    const options = createTestOptions({
      resolver: 'react',
      extensions: ['tsx', 'jsx'],
    })
    const code = generateReactRoutes(options, 'vite')

    // 检查是否导入 React
    expect(code).toContain("import React from 'react'")
    // 检查是否包含 import.meta.glob
    expect(code).toContain('import.meta.glob')
    // 检查是否使用 React.lazy
    expect(code).toContain('React.lazy')
    // 检查是否使用 React.createElement
    expect(code).toContain('React.createElement')
  })
})

describe('generateReactRoutes - Rspack', () => {
  it('生成基本的路由代码', () => {
    const options = createTestOptions({
      resolver: 'react',
      extensions: ['tsx', 'jsx'],
    })
    const code = generateReactRoutes(options, 'rspack')

    // 检查是否导入 React
    expect(code).toContain("import React from 'react'")
    // 检查是否包含 import.meta.webpackContext
    expect(code).toContain('import.meta.webpackContext')
    // 检查是否使用 React.lazy
    expect(code).toContain('React.lazy')
  })
})

describe('路由路径转换', () => {
  it('代码中包含 Next.js 风格动态路由转换', () => {
    const options = createTestOptions({ resolver: 'vue' })
    const code = generateVueRoutes(options, 'vite')

    // 检查是否包含动态路由转换逻辑
    expect(code).toContain('[')
    expect(code).toContain(':')
  })

  it('代码中包含 Remix 风格动态路由转换', () => {
    const options = createTestOptions({ resolver: 'vue' })
    const code = generateVueRoutes(options, 'vite')

    // 检查是否包含 Remix 风格转换逻辑
    expect(code).toContain('$')
  })

  it('代码中包含忽略路由逻辑', () => {
    const options = createTestOptions({ resolver: 'vue' })
    const code = generateVueRoutes(options, 'vite')

    // 检查是否包含忽略 __xxx__ 格式的逻辑
    expect(code).toContain('__.*__')
    expect(code).toContain('shouldIgnore')
  })
})
