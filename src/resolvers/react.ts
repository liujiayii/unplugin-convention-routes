import type { BuildTool, ResolvedOptions } from "../core/types"
import { getGlobPattern, getWebpackContextPattern } from "../core/path"
import { createExcludePatterns, escapeRegExp, generateExcludeCheck, generateRoutePathTransformCode } from "./utils"

/**
 * React 路由接口定义
 */
export interface ReactRoute {
  path: string
  element: React.ReactElement
  children?: ReactRoute[]
}

/**
 * 生成 React + Vite 的路由代码
 * 使用 import.meta.glob 自动扫描页面文件
 * @param options - 解析后的配置选项
 * @returns 生成的路由代码字符串
 */
export function generateReactViteCode(options: ResolvedOptions): string {
  const contextBlocks: string[] = []
  // 在循环外创建正则表达式数组，避免每次迭代重复创建
  const excludePatternsCode = createExcludePatterns(options.exclude)
  // 只有当有排除模式时才生成检查代码
  const excludeCheckCode = excludePatternsCode ? generateExcludeCheck("path") : ""

  for (const dir of options.dirs) {
    const globPattern = getGlobPattern(dir, options.extensions)
    const contextVar = `__pages_${contextBlocks.length}__`
    const basePath = dir.baseRoute ? `/${dir.baseRoute}` : ""
    const escapedDir = escapeRegExp(dir.dir)

    const routePathCode = generateRoutePathTransformCode(
      "path",
      escapedDir,
      basePath,
      options.extensions,
      "/*",
      options.caseSensitive,
    )

    contextBlocks.push(`
const ${contextVar} = import.meta.glob('${globPattern}')
Object.entries(${contextVar}).forEach(([path, moduleFn]) => {
  const pathSegments = path.split('/')
  const shouldIgnore = pathSegments.some(seg => /^__.*__$/.test(seg))
  if (shouldIgnore) return
${excludeCheckCode ? `  ${excludeCheckCode}\n` : ""}  ${routePathCode}

  routes.push({
    path: routePath,
    element: React.createElement(React.lazy(moduleFn))
  })
})`)
  }

  return `import React from 'react'

const routes = []
${excludePatternsCode ? `${excludePatternsCode}\n` : ""}${contextBlocks.join("\n")}

export default routes
`
}

/**
 * 生成 React + Rspack 的路由代码
 * 使用 import.meta.webpackContext 自动扫描页面文件
 * @param options - 解析后的配置选项
 * @returns 生成的路由代码字符串
 */
export function generateReactRspackCode(options: ResolvedOptions): string {
  const contextBlocks: string[] = []
  // 在循环外创建正则表达式数组，避免每次迭代重复创建
  const excludePatternsCode = createExcludePatterns(options.exclude)
  // 只有当有排除模式时才生成检查代码
  const excludeCheckCode = excludePatternsCode ? generateExcludeCheck("key") : ""

  for (const dir of options.dirs) {
    const pattern = getWebpackContextPattern(dir, options.extensions, options.root)
    const contextVar = `__pages_${contextBlocks.length}__`
    const basePath = dir.baseRoute ? `/${dir.baseRoute}` : ""
    const escapedDir = escapeRegExp(pattern.path)

    const routePathCode = generateRoutePathTransformCode(
      "key",
      escapedDir,
      basePath,
      options.extensions,
      "/*",
      options.caseSensitive,
    )

    contextBlocks.push(`
const ${contextVar} = import.meta.webpackContext('${pattern.path}', {
  recursive: ${pattern.recursive},
  regExp: /${pattern.regExp}$/
})
${contextVar}.keys().forEach((key) => {
  const pathSegments = key.split('/')
  const shouldIgnore = pathSegments.some(seg => /^__.*__$/.test(seg))
  if (shouldIgnore) return
${excludeCheckCode ? `  ${excludeCheckCode}\n` : ""}  ${routePathCode}

  const loadModule = async () => {
    const module = await ${contextVar}(key)
    return { default: module.default || module }
  }

  routes.push({
    path: routePath,
    element: React.createElement(React.lazy(loadModule))
  })
})`)
  }

  return `import React from 'react'

const routes = []
${excludePatternsCode ? `${excludePatternsCode}\n` : ""}${contextBlocks.join("\n")}

export default routes
`
}

/**
 * 根据构建工具生成对应的 React 路由代码
 * @param options - 解析后的配置选项
 * @param buildTool - 构建工具类型
 * @returns 生成的路由代码字符串
 */
export function generateReactRoutes(options: ResolvedOptions, buildTool: BuildTool): string {
  return buildTool === "vite"
    ? generateReactViteCode(options)
    : generateReactRspackCode(options)
}
