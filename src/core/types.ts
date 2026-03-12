import type { Awaitable } from "@antfu/utils"

/**
 * 路由解析器类型
 * 支持 vue 和 react 两种框架
 */
export type Resolver = "vue" | "react"

/**
 * 构建工具类型
 * 支持 vite 和 rspack 两种构建工具
 */
export type BuildTool = "vite" | "rspack"

/**
 * 页面目录配置
 */
export interface PageDir {
  /** 目录路径 */
  dir: string
  /** 基础路由前缀 */
  baseRoute?: string
  /** 文件匹配模式 */
  filePattern?: string
}

/**
 * 用户配置选项
 */
export interface UserOptions {
  /** 路由解析器类型（必填） */
  resolver: Resolver
  /** 页面目录配置，可以是字符串或 PageDir 数组，默认 'src/pages' */
  dirs?: string | PageDir[]
  /** 文件扩展名，默认 Vue: ['vue', 'ts', 'js'] / React: ['tsx', 'jsx', 'ts', 'js'] */
  extensions?: string[]
  /** 排除的文件模式 */
  exclude?: string[]
  /** 导入路径风格 */
  importPath?: "absolute" | "relative"
  /** 路径大小写敏感，默认 false */
  caseSensitive?: boolean
  /** 路由名称分隔符，默认 '-' */
  routeNameSeparator?: string
  /** 扩展路由配置的钩子函数 */
  extendRoute?: (route: any, parent: any | undefined) => any | void
  /** 路由生成后的钩子函数 */
  onRoutesGenerated?: (routes: any[]) => Awaitable<any[] | void>
  /** 客户端代码生成后的钩子函数 */
  onClientGenerated?: (clientCode: string) => Awaitable<string | void>
}

/**
 * 解析后的配置选项
 */
export interface ResolvedOptions {
  /** 项目根目录 */
  root: string
  /** 路由解析器类型 */
  resolver: Resolver
  /** 页面目录配置数组 */
  dirs: PageDir[]
  /** 文件扩展名数组 */
  extensions: string[]
  /** 排除的文件模式数组 */
  exclude: string[]
  /** 导入路径风格 */
  importPath: "absolute" | "relative"
  /** 路径大小写敏感 */
  caseSensitive: boolean
  /** 路由名称分隔符 */
  routeNameSeparator: string
  /** 扩展路由配置的钩子函数 */
  extendRoute?: (route: any, parent: any | undefined) => any | void
  /** 路由生成后的钩子函数 */
  onRoutesGenerated?: (routes: any[]) => Awaitable<any[] | void>
  /** 客户端代码生成后的钩子函数 */
  onClientGenerated?: (clientCode: string) => Awaitable<string | void>
}

/**
 * 路由元数据
 */
export interface RouteMeta {
  /** 文件路径 */
  path: string
  /** 路由路径 */
  routePath: string
  /** 路由名称 */
  name: string
  /** 组件路径 */
  component: string
  /** 子路由 */
  children?: RouteMeta[]
}
