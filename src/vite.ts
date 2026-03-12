/**
 * Vite 插件入口
 * 使用 unplugin 的 createVitePlugin 创建 Vite 兼容的插件
 */
import { createVitePlugin } from "unplugin"
import { unpluginFactory } from "./index"

export default createVitePlugin(unpluginFactory)
