import type { BuildTool, ResolvedOptions } from "../core/types"
import { getGlobPattern, getWebpackContextPattern } from "../core/path"

/**
 * React 路由接口定义
 */
export interface ReactRoute {
  path: string
  element: React.ReactElement
  children?: ReactRoute[]
}

/**
 * 转义正则表达式中的特殊字符
 * @param str - 待转义的字符串
 * @returns 转义后的字符串
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * 生成 React + Vite 的路由代码
 * 使用 import.meta.glob 自动扫描页面文件
 * @param options - 解析后的配置选项
 * @returns 生成的路由代码字符串
 */
export function generateReactViteCode(options: ResolvedOptions): string {
  const contextBlocks: string[] = []

  for (const dir of options.dirs) {
    const globPattern = getGlobPattern(dir, options.extensions)
    const contextVar = `__pages_${contextBlocks.length}__`
    const basePath = dir.baseRoute ? `/${dir.baseRoute}` : ""
    // 转义路径用于正则表达式
    const escapedDir = escapeRegExp(dir.dir)

    // 生成路由扫描和处理代码
    contextBlocks.push(`
const ${contextVar} = import.meta.glob('${globPattern}')
Object.entries(${contextVar}).forEach(([path, module]) => {
  // 忽略 __xxx 格式的文件/目录（Remix 风格）
  const pathSegments = path.split('/')
  const shouldIgnore = pathSegments.some(seg => /^__.*__$/.test(seg))
  if (shouldIgnore) return

  let routePath = path
    .replace(/${escapedDir}/, '')
    .replace(/\\.(tsx|jsx|ts|js)$/, '')
    .replace(/\\/index$/, '')
    .replace(/\\[(\\.\\.\\.)?(.+?)\\]/g, (_, isCatchAll, name) =>
      isCatchAll ? \`:\${name}(.*)*\` : \`:\${name}\`
    )
    .replace(/\\$(.+)/g, ':$1') // Remix 风格: $id -> :id
    .replace(/\\$$/, '(.*)*') // Remix 风格: $ -> catch-all
    ${options.caseSensitive ? "" : ".toLowerCase()"}

  routePath = '${basePath}' + routePath || '/'

  routes.push({
    path: routePath,
    element: React.createElement(React.lazy(module as any))
  })
})`)
  }

  return `import React from 'react'

const routes = []
${contextBlocks.join("\n")}

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

  for (const dir of options.dirs) {
    const pattern = getWebpackContextPattern(dir, options.extensions, options.root)
    const contextVar = `__pages_${contextBlocks.length}__`
    const basePath = dir.baseRoute ? `/${dir.baseRoute}` : ""
    // 转义路径用于正则表达式
    const escapedDir = escapeRegExp(pattern.path)

    // 生成路由扫描和处理代码
    // 注意：Rspack 的 webpackContext 使用绝对路径
    contextBlocks.push(`
const ${contextVar} = import.meta.webpackContext('${pattern.path}', {
  recursive: ${pattern.recursive},
  regExp: /${pattern.regExp}$/
})
${contextVar}.keys().forEach((key) => {
  // 忽略 __xxx 格式的文件/目录（Remix 风格）
  const pathSegments = key.split('/')
  const shouldIgnore = pathSegments.some(seg => /^__.*__$/.test(seg))
  if (shouldIgnore) return

  let routePath = key
    .replace(/${escapedDir}/, '')
    .replace(/\\.(tsx|jsx|ts|js)$/, '')
    .replace(/\\/index$/, '')
    .replace(/\\[(\\.\\.\\.)?(.+?)\\]/g, (_, isCatchAll, name) =>
      isCatchAll ? \`:\${name}(.*)*\` : \`:\${name}\`
    )
    .replace(/\\$(.+)/g, ':$1') // Remix 风格: $id -> :id
    .replace(/\\$$/, '(.*)*') // Remix 风格: $ -> catch-all
    ${options.caseSensitive ? "" : ".toLowerCase()"}

  routePath = '${basePath}' + routePath || '/'

  routes.push({
    path: routePath,
    element: React.createElement(React.lazy(() => ${contextVar}(key)))
  })
})`)
  }

  return `import React from 'react'

const routes = []
${contextBlocks.join("\n")}

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
