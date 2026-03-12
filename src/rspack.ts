/**
 * Rspack 插件入口
 * 使用 unplugin 的 createRspackPlugin 创建 Rspack 兼容的插件
 */
import { createRspackPlugin } from "unplugin"
import { unpluginFactory } from "./index"

export default createRspackPlugin(unpluginFactory)
