import type { UnpluginFactory } from "unplugin"
import type { BuildTool, UserOptions } from "./core/types"

import { createUnplugin } from "unplugin"
import { resolveOptions } from "./core/options"
import { generateRoutes } from "./resolvers"

/**
 * 虚拟模块 ID 映射表
 * 根据不同的 resolver 类型提供不同的虚拟模块 ID
 */
const VIRTUAL_MODULE_IDS = {
  vue: [
    "virtual:unplugin-convention-routes/vue",
    "~pages", // 兼容旧版 API
  ],
  react: [
    "virtual:unplugin-convention-routes/react",
    "~react-pages", // 兼容旧版 API
  ],
}

/**
 * unplugin 工厂函数
 * 创建约定式路由插件的核心实现
 * @param userOptions - 用户配置选项
 * @param meta - unplugin 提供的元信息
 * @param meta.framework - 构建工具框架类型
 * @returns unplugin 插件对象
 */
export const unpluginFactory: UnpluginFactory<UserOptions> = (userOptions, { framework }) => {
  // 解析用户配置
  const options = resolveOptions(userOptions)
  // 根据 framework 确定构建工具类型
  const buildTool: BuildTool = framework === "vite" ? "vite" : "rspack"

  // 获取当前 resolver 对应的虚拟模块 ID 列表
  const virtualIds = VIRTUAL_MODULE_IDS[options.resolver]

  return {
    name: "unplugin-convention-routes",

    /**
     * 解析模块 ID
     * 将虚拟模块 ID 转换为内部 ID
     * @param id - 模块 ID
     * @returns 解析后的模块 ID 或 null
     */
    resolveId(id) {
      if (virtualIds.includes(id)) {
        return virtualIds[0]
      }
      return null
    },

    /**
     * 加载模块内容
     * 为虚拟模块生成路由代码
     * @param id - 模块 ID
     * @returns 生成的代码或 null
     */
    load(id) {
      if (id === virtualIds[0]) {
        return generateRoutes(options, buildTool)
      }
      return null
    },
  }
}

/**
 * 创建 unplugin 实例
 */
export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

// 导出类型定义
export * from "./core/types"
