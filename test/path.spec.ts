/**
 * 路径解析工具测试
 */
import { describe, expect, it } from 'vitest'
import {
  getCatchAllRouteName,
  getDynamicRouteName,
  getGlobPattern,
  getWebpackContextPattern,
  isCatchAllRoute,
  isDynamicRoute,
  isIgnoredRoute,
  normalizePath,
  parsePathSegment,
} from '../src/core/path'

describe('normalizePath', () => {
  it('大小写不敏感时转换为小写', () => {
    expect(normalizePath('About', false)).toBe('about')
    expect(normalizePath('ABOUT', false)).toBe('about')
    expect(normalizePath('about', false)).toBe('about')
  })

  it('大小写敏感时保持原样', () => {
    expect(normalizePath('About', true)).toBe('About')
    expect(normalizePath('ABOUT', true)).toBe('ABOUT')
    expect(normalizePath('about', true)).toBe('about')
  })
})

describe('isDynamicRoute', () => {
  it('Next.js 风格动态路由', () => {
    expect(isDynamicRoute('[id]')).toBe(true)
    expect(isDynamicRoute('[slug]')).toBe(true)
    expect(isDynamicRoute('[...all]')).toBe(true)
    expect(isDynamicRoute('about')).toBe(false)
    expect(isDynamicRoute('index')).toBe(false)
  })

  it('Remix 风格动态路由', () => {
    expect(isDynamicRoute('$id')).toBe(true)
    expect(isDynamicRoute('$slug')).toBe(true)
    expect(isDynamicRoute('about')).toBe(false)
    expect(isDynamicRoute('index')).toBe(false)
  })
})

describe('isCatchAllRoute', () => {
  it('Next.js 风格捕获所有路由', () => {
    expect(isCatchAllRoute('[...all]')).toBe(true)
    expect(isCatchAllRoute('[...catchAll]')).toBe(true)
    expect(isCatchAllRoute('[id]')).toBe(false)
    expect(isCatchAllRoute('about')).toBe(false)
  })

  it('Remix 风格捕获所有路由', () => {
    expect(isCatchAllRoute('$')).toBe(true)
    expect(isCatchAllRoute('$id')).toBe(false)
    expect(isCatchAllRoute('about')).toBe(false)
  })
})

describe('isIgnoredRoute', () => {
  it('Remix 风格忽略路由', () => {
    expect(isIgnoredRoute('__test__')).toBe(true)
    expect(isIgnoredRoute('__components__')).toBe(true)
    expect(isIgnoredRoute('about')).toBe(false)
    expect(isIgnoredRoute('_test')).toBe(false)
  })
})

describe('getDynamicRouteName', () => {
  it('Next.js 风格', () => {
    expect(getDynamicRouteName('[id]')).toBe('id')
    expect(getDynamicRouteName('[slug]')).toBe('slug')
  })

  it('Remix 风格', () => {
    expect(getDynamicRouteName('$id')).toBe('id')
    expect(getDynamicRouteName('$slug')).toBe('slug')
  })
})

describe('getCatchAllRouteName', () => {
  it('Next.js 风格', () => {
    expect(getCatchAllRouteName('[...all]')).toBe('all')
    expect(getCatchAllRouteName('[...catchAll]')).toBe('catchAll')
  })

  it('Remix 风格', () => {
    expect(getCatchAllRouteName('$')).toBe('all')
  })
})

describe('parsePathSegment', () => {
  it('静态路由', () => {
    const result = parsePathSegment('about')
    expect(result.isDynamic).toBe(false)
    expect(result.isCatchAll).toBe(false)
    expect(result.name).toBe('about')
  })

  it('Next.js 动态路由', () => {
    const result = parsePathSegment('[id]')
    expect(result.isDynamic).toBe(true)
    expect(result.isCatchAll).toBe(false)
    expect(result.name).toBe('id')
  })

  it('Next.js 捕获所有路由', () => {
    const result = parsePathSegment('[...all]')
    expect(result.isDynamic).toBe(true)
    expect(result.isCatchAll).toBe(true)
    expect(result.name).toBe('all')
  })

  it('Remix 动态路由', () => {
    const result = parsePathSegment('$id')
    expect(result.isDynamic).toBe(true)
    expect(result.isCatchAll).toBe(false)
    expect(result.name).toBe('id')
  })

  it('Remix 捕获所有路由', () => {
    const result = parsePathSegment('$')
    // $ 单独使用是捕获所有路由，不是动态路由
    expect(result.isDynamic).toBe(false)
    expect(result.isCatchAll).toBe(true)
    expect(result.name).toBe('all')
  })
})

describe('getGlobPattern', () => {
  it('单个扩展名', () => {
    const pattern = getGlobPattern({ dir: 'src/pages' }, ['vue'])
    expect(pattern).toBe('/src/pages/**/*.vue')
  })

  it('多个扩展名', () => {
    const pattern = getGlobPattern({ dir: 'src/pages' }, ['vue', 'ts', 'js'])
    expect(pattern).toBe('/src/pages/**/*.{vue,ts,js}')
  })

  it('绝对路径', () => {
    const pattern = getGlobPattern({ dir: '/src/pages' }, ['vue'])
    expect(pattern).toBe('/src/pages/**/*.vue')
  })
})

describe('getWebpackContextPattern', () => {
  it('单个扩展名', () => {
    const pattern = getWebpackContextPattern({ dir: 'src/pages' }, ['vue'], '/project')
    expect(pattern.path).toBe('/project/src/pages')
    expect(pattern.recursive).toBe(true)
    expect(pattern.regExp).toBe('\\.(vue)$')
  })

  it('多个扩展名', () => {
    const pattern = getWebpackContextPattern({ dir: 'src/pages' }, ['vue', 'ts', 'js'], '/project')
    expect(pattern.path).toBe('/project/src/pages')
    expect(pattern.recursive).toBe(true)
    expect(pattern.regExp).toBe('\\.(vue|ts|js)$')
  })

  it('绝对路径', () => {
    const pattern = getWebpackContextPattern({ dir: '/src/pages' }, ['vue'], '/project')
    expect(pattern.path).toBe('/project/src/pages')
  })
})
