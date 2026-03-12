import type { BuildTool, ResolvedOptions } from "../core/types"
import { getGlobPattern, getWebpackContextPattern } from "../core/path"

/**
 * Vue 路由接口定义
 */
export interface VueRoute {
  path: string
  name: string
  component: () => Promise<any>
  children?: VueRoute[]
}

/**
 * 正则表达式特殊字符匹配模式
 * 移到模块作用域以避免每次调用重新编译
 */
const ESCAPE_REGEXP = /[.*+?^${}()|[\]\\/:]/g

/**
 * 转义正则表达式中的特殊字符
 * 包括 Windows 路径中的特殊字符（如 / 和 :）
 * @param str - 待转义的字符串
 * @returns 转义后的字符串
 */
function escapeRegExp(str: string): string {
  return str.replace(ESCAPE_REGEXP, "\\$&")
}

/**
 * 将 glob 模式转换为正则表达式
 * 支持 **、*、? 等基本 glob 语法
 * @param pattern - glob 模式
 * @returns 正则表达式字符串
 */
function globToRegExp(pattern: string): string {
  return pattern
    .replace(/\*\*/g, "<<<DOUBLE_STAR>>>")
    .replace(/\*/g, "[^/]*")
    .replace(/<<<DOUBLE_STAR>>>/g, ".*")
    .replace(/\?/g, "[^/]")
    .replace(/\./g, "\\.")
    .replace(/\//g, "\\/")
}

/**
 * 生成 exclude 过滤代码
 * @param exclude - 排除模式数组
 * @param pathVarName - 路径变量名，Vite 用 'path'，Rspack 用 'key'
 * @returns 过滤代码字符串
 */
function generateExcludeFilter(exclude: string[], pathVarName: string = "path"): string {
  if (!exclude || exclude.length === 0) {
    return ""
  }

  const patterns = exclude.map(p => globToRegExp(p))
  return `
  // 检查是否匹配排除模式
  const excludePatterns = [${patterns.map(p => `new RegExp('${p}')`).join(", ")}]
  const shouldExclude = excludePatterns.some(pattern => pattern.test(${pathVarName}))
  if (shouldExclude) return
`
}

/**
 * 生成 Vue + Vite 的路由代码
 * 使用 import.meta.glob 自动扫描页面文件
 * @param options - 解析后的配置选项
 * @returns 生成的路由代码字符串
 */
export function generateVueViteCode(options: ResolvedOptions): string {
  const contextBlocks: string[] = []
  const excludeFilter = generateExcludeFilter(options.exclude)

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
${excludeFilter}
  let routePath = path
    .replace(/${escapedDir}/, '')
    .replace(/^\\//, '') // 移除开头的 /
    .replace(/\\.(vue|ts|js)$/, '')
    .replace(/\\/index$/, '') // 移除结尾的 /index
    .replace(/^index$/, '') // 移除单独的 index
    .replace(/\\[(\\.\\.\\.)?(.+?)\\]/g, (_, isCatchAll, name) =>
      isCatchAll ? \`:\${name}(.*)*\` : \`:\${name}\`
    )
    .replace(/\\$(.+)/g, ':$1') // Remix 风格: $id -> :id
    .replace(/\\$$/, '(.*)*') // Remix 风格: $ -> catch-all
    ${options.caseSensitive ? "" : ".toLowerCase()"}

  routePath = '${basePath}' + (routePath ? '/' + routePath : '') || '/'

  const name = path
    .replace(/${escapedDir}/, '')
    .replace(/^\\//, '') // 移除开头的 /
    .replace(/\\.(vue|ts|js)$/, '')
    .replace(/\\/index$/, '') // 移除结尾的 /index
    .replace(/^index$/, '') // 移除单独的 index
    .replace(/\\//g, '${options.routeNameSeparator}')
    .replace(/\\[(\\.\\.\\.)?(.+?)\\]/g, '$2') // Next.js 风格
    .replace(/\\$(.+)/g, '$1') // Remix 风格
    .replace(/^${options.routeNameSeparator}/, '') || 'index'

  routes.push({
    path: routePath,
    name,
    component: module
  })
})`)
  }

  return `const routes = []
${contextBlocks.join("\n")}

export default routes
`
}

/**
 * 生成 Vue + Rspack 的路由代码
 * 使用 import.meta.webpackContext 自动扫描页面文件
 * @param options - 解析后的配置选项
 * @returns 生成的路由代码字符串
 */
export function generateVueRspackCode(options: ResolvedOptions): string {
  const contextBlocks: string[] = []
  const excludeFilter = generateExcludeFilter(options.exclude, "key")

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
${excludeFilter}
  let routePath = key
    .replace(/${escapedDir}/, '')
    .replace(/^\\.\\//, '') // 移除开头的 ./
    .replace(/^\\//, '') // 移除开头的 /
    .replace(/\\.(vue|ts|js)$/, '')
    .replace(/\\/index$/, '') // 移除结尾的 /index
    .replace(/^index$/, '') // 移除单独的 index
    .replace(/\\[(\\.\\.\\.)?(.+?)\\]/g, (_, isCatchAll, name) =>
      isCatchAll ? \`:\${name}(.*)*\` : \`:\${name}\`
    )
    .replace(/\\$(.+)/g, ':$1') // Remix 风格: $id -> :id
    .replace(/\\$$/, '(.*)*') // Remix 风格: $ -> catch-all
    ${options.caseSensitive ? "" : ".toLowerCase()"}

  routePath = '${basePath}' + (routePath ? '/' + routePath : '') || '/'

  const name = key
    .replace(/${escapedDir}/, '')
    .replace(/^\\.\\//, '') // 移除开头的 ./
    .replace(/^\\//, '') // 移除开头的 /
    .replace(/\\.(vue|ts|js)$/, '')
    .replace(/\\/index$/, '') // 移除结尾的 /index
    .replace(/^index$/, '') // 移除单独的 index
    .replace(/\\//g, '${options.routeNameSeparator}')
    .replace(/\\[(\\.\\.\\.)?(.+?)\\]/g, '$2') // Next.js 风格
    .replace(/\\$(.+)/g, '$1') // Remix 风格
    .replace(/^${options.routeNameSeparator}/, '') || 'index'

  routes.push({
    path: routePath,
    name,
    component: () => ${contextVar}(key)
  })
})`)
  }

  return `const routes = []
${contextBlocks.join("\n")}

export default routes
`
}

/**
 * 根据构建工具生成对应的 Vue 路由代码
 * @param options - 解析后的配置选项
 * @param buildTool - 构建工具类型
 * @returns 生成的路由代码字符串
 */
export function generateVueRoutes(options: ResolvedOptions, buildTool: BuildTool): string {
  return buildTool === "vite"
    ? generateVueViteCode(options)
    : generateVueRspackCode(options)
}
