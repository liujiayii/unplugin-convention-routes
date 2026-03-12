import type { PageDir } from "./types"

/**
 * 动态路由正则 - Next.js 风格 [id]
 */
const DYNAMIC_ROUTE_RE = /^\[(.+)\]$/

/**
 * 动态路由正则 - Remix 风格 $id
 */
const REMIX_DYNAMIC_ROUTE_RE = /^\$(.+)$/

/**
 * 捕获所有路由正则 - Next.js 风格 [...all]
 */
const CATCH_ALL_ROUTE_RE = /^\[\.{3}(.*)\]$/

/**
 * 捕获所有路由正则 - Remix 风格 $
 */
const REMIX_CATCH_ALL_ROUTE_RE = /^\$$/

/**
 * 忽略的目录/文件正则 - Remix 风格 __xxx
 */
const IGNORE_ROUTE_RE = /^__.*__$/

/**
 * 路径扩展名正则 - Remix 风格 .xxx（如 [sitemap.xml]）
 * 注：暂未使用，保留以备后续功能扩展
 */
const _EXTENSION_ROUTE_RE = /^\[(.+)\.(\w+)\]$/

/**
 * 根据大小写敏感设置规范化路径
 * @param path - 待规范化的路径
 * @param caseSensitive - 是否大小写敏感
 * @returns 规范化后的路径
 */
export function normalizePath(path: string, caseSensitive: boolean): string {
  return caseSensitive ? path : path.toLowerCase()
}

/**
 * 检查是否为动态路由段
 * 支持 Next.js 风格 [id] 和 Remix 风格 $id
 * @param segment - 路径段
 * @returns 是否为动态路由
 */
export function isDynamicRoute(segment: string): boolean {
  return DYNAMIC_ROUTE_RE.test(segment) || REMIX_DYNAMIC_ROUTE_RE.test(segment)
}

/**
 * 检查是否为捕获所有路由段
 * 支持 Next.js 风格 [...all] 和 Remix 风格 $
 * @param segment - 路径段
 * @returns 是否为捕获所有路由
 */
export function isCatchAllRoute(segment: string): boolean {
  return CATCH_ALL_ROUTE_RE.test(segment) || REMIX_CATCH_ALL_ROUTE_RE.test(segment)
}

/**
 * 检查是否为忽略的路由（Remix 风格 __xxx）
 * @param segment - 路径段
 * @returns 是否应忽略
 */
export function isIgnoredRoute(segment: string): boolean {
  return IGNORE_ROUTE_RE.test(segment)
}

/**
 * 从动态路由段中提取参数名
 * @param segment - 路径段
 * @returns 参数名
 */
export function getDynamicRouteName(segment: string): string {
  // 先尝试 Next.js 风格
  if (DYNAMIC_ROUTE_RE.test(segment)) {
    return segment.replace(DYNAMIC_ROUTE_RE, "$1")
  }
  // 再尝试 Remix 风格
  if (REMIX_DYNAMIC_ROUTE_RE.test(segment)) {
    return segment.replace(REMIX_DYNAMIC_ROUTE_RE, "$1")
  }
  return segment
}

/**
 * 从捕获所有路由段中提取参数名
 * @param segment - 路径段
 * @returns 参数名
 */
export function getCatchAllRouteName(segment: string): string {
  // 先尝试 Next.js 风格
  if (CATCH_ALL_ROUTE_RE.test(segment)) {
    return segment.replace(CATCH_ALL_ROUTE_RE, "$1")
  }
  // Remix 风格 $ 默认返回 'all' 或 '*'
  if (REMIX_CATCH_ALL_ROUTE_RE.test(segment)) {
    return "all"
  }
  return segment
}

/**
 * 解析路径段
 * @param segment - 路径段
 * @returns 路由信息对象
 */
export function parsePathSegment(segment: string): {
  isDynamic: boolean
  isCatchAll: boolean
  name: string
} {
  const isDynamic = isDynamicRoute(segment)
  const isCatchAll = isCatchAllRoute(segment)

  let name: string
  if (isCatchAll) {
    name = getCatchAllRouteName(segment)
  }
  else if (isDynamic) {
    name = getDynamicRouteName(segment)
  }
  else {
    name = segment
  }

  return { isDynamic, isCatchAll, name }
}

/**
 * 生成 Vite 的 glob 匹配模式
 * @param dir - 页面目录配置
 * @param extensions - 文件扩展名列表
 * @returns glob 匹配模式字符串
 */
export function getGlobPattern(dir: PageDir, extensions: string[]): string {
  const ext = extensions.length > 1 ? `{${extensions.join(",")}}` : extensions[0]
  // Vite glob 需要使用 / 开头的绝对路径（相对于项目根目录）
  const dirPath = dir.dir.startsWith("/") ? dir.dir : `/${dir.dir}`
  return `${dirPath}/**/*.${ext}`
}

/**
 * 生成 Rspack/Webpack 的 context 匹配模式
 * 注意：Rspack 虚拟模块中的相对路径会有问题，所以使用绝对路径
 * @param dir - 页面目录配置
 * @param extensions - 文件扩展名列表
 * @param root - 项目根目录
 * @returns context 配置对象
 */
export function getWebpackContextPattern(
  dir: PageDir,
  extensions: string[],
  root: string,
): {
  path: string
  recursive: boolean
  regExp: string
} {
  // 扩展名模式：vue|ts|js
  const extPattern = extensions.join("|")
  // Rspack 虚拟模块中相对路径会出问题，使用绝对路径
  // 确保路径以 / 开头
  let dirPath = dir.dir
  if (!dirPath.startsWith("/")) {
    dirPath = `/${dirPath}`
  }
  // 组合成完整的绝对路径
  const fullPath = root + dirPath
  return {
    path: fullPath,
    recursive: true,
    regExp: `\\.(${extPattern})$`,
  }
}
