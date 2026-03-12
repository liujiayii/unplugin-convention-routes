import type { PageDir, ResolvedOptions, Resolver, UserOptions } from "./types"
import process from "node:process"
import { slash, toArray } from "@antfu/utils"

/**
 * 各框架默认支持的文件扩展名
 */
const DEFAULT_EXTENSIONS: Record<Resolver, string[]> = {
  vue: ["vue", "ts", "js"],
  react: ["tsx", "jsx", "ts", "js"],
}

/**
 * 解析用户配置选项
 * 将用户提供的配置转换为内部使用的完整配置对象
 * @param userOptions - 用户配置选项
 * @returns 解析后的完整配置对象
 */
export function resolveOptions(userOptions: UserOptions): ResolvedOptions {
  const {
    // 必填项：路由解析器类型
    resolver,
    // 可选项：页面目录，默认为 'src/pages'
    dirs = "src/pages",
    // 可选项：文件扩展名，根据 resolver 类型有不同默认值
    extensions = DEFAULT_EXTENSIONS[resolver],
    // 可选项：排除的文件模式
    exclude = ["node_modules", ".git", "**/__*__/**"],
    // 可选项：导入路径风格
    importPath = "relative",
    // 可选项：路径大小写敏感
    caseSensitive = false,
    // 可选项：路由名称分隔符
    routeNameSeparator = "-",
    // 可选项：钩子函数
    extendRoute,
    onRoutesGenerated,
    onClientGenerated,
  } = userOptions

  // 获取项目根目录，并统一使用正斜杠
  const root = slash(process.cwd())

  // 将 dirs 统一转换为 PageDir 数组格式
  // 同时将路径中的反斜杠转换为正斜杠，避免 Windows 路径问题
  const normalizedDirs = typeof dirs === "string" ? { dir: dirs, baseRoute: "" } : dirs
  const resolvedDirs: PageDir[] = toArray(normalizedDirs).map((dir) => {
    if (typeof dir === "string") {
      return { dir: slash(dir), baseRoute: "" }
    }
    return {
      ...dir,
      dir: slash(dir.dir),
    }
  })

  return {
    root,
    resolver,
    dirs: resolvedDirs,
    extensions,
    exclude,
    importPath,
    caseSensitive,
    routeNameSeparator,
    extendRoute,
    onRoutesGenerated,
    onClientGenerated,
  }
}
