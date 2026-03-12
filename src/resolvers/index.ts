import type { BuildTool, ResolvedOptions, Resolver } from "../core/types"
import { generateReactRoutes } from "./react"
import { generateVueRoutes } from "./vue"

/**
 * 路由解析器模块
 * 根据不同的框架类型生成对应的路由代码
 */

// 导出所有类型和函数
export * from "./react"
export * from "./vue"

/**
 * 路由生成器映射表
 * 将 resolver 类型映射到对应的路由生成函数
 */
const generators: Record<Resolver, (options: ResolvedOptions, buildTool: BuildTool) => string> = {
  vue: generateVueRoutes,
  react: generateReactRoutes,
}

/**
 * 生成路由代码
 * 根据配置的 resolver 类型选择对应的生成器
 * @param options - 解析后的配置选项
 * @param buildTool - 构建工具类型
 * @returns 生成的路由代码字符串
 */
export function generateRoutes(options: ResolvedOptions, buildTool: BuildTool): string {
  return generators[options.resolver](options, buildTool)
}
