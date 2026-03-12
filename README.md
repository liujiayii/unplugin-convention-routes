<p align="center">
  <a href="https://www.npmjs.org/package/unplugin-convention-routes">
    <img src="https://img.shields.io/npm/v/unplugin-convention-routes.svg" alt="npm version">
  </a>
  <a href="https://npmcharts.com/compare/unplugin-convention-routes?minimal=true">
    <img src="https://img.shields.io/npm/dm/@unplugin-convention-routes.svg" alt="npm downloads">
  </a>
  <br>
</p>

<p align="center">unplugin-convention-routes</p>

🔥 基于文件系统的约定式路由解决方案。

🔥 基于 `unplugin` 开发，支持 `Vite` 和 `Rspack` 构建工具，同时支持 `React` 和 `Vue` 框架。

⚡️ 使用 `import.meta.glob` (Vite) 和 `import.meta.webpackContext` (Rspack) 实现零运行时依赖，自动支持 HMR。

***

## 📦 安装

```bash
pnpm i unplugin-convention-routes
```

## 🚀 使用

### Vite

```ts
// vite.config.ts
import Pages from "unplugin-convention-routes/vite"

export default defineConfig({
  plugins: [
    Pages({ resolver: "vue" }), // 或 'react'
  ],
})
```

### Rspack

```ts
// rsbuild.config.ts
import Pages from "unplugin-convention-routes/rspack"

export default defineConfig({
  tools: {
    rspack: {
      plugins: [
        Pages({ resolver: "vue" }), // 或 'react'
      ],
    },
  },
})
```

## 📖 路由约定

### 文件命名规则

| 文件名                 | 路由路径              |
| ------------------- | ----------------- |
| `index.vue`         | `/`               |
| `about.vue`         | `/about`          |
| `about/index.vue`   | `/about`          |
| `blog/[id].vue`     | `/blog/:id`       |
| `blog/[...all].vue` | `/blog/:all(.*)*` |

### Vue 使用

```ts
// env.d.ts
/// <reference types="unplugin-convention-routes/client-vue" />
```

```ts
import { createRouter, createWebHistory } from "vue-router"
// main.ts
import routes from "~pages"

const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

### React 使用

```ts
// env.d.ts
/// <reference types="unplugin-convention-routes/client-react" />
```

```tsx
import { BrowserRouter, useRoutes } from "react-router-dom"
// main.tsx
import routes from "~react-pages"

function App() {
  return useRoutes(routes)
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

## ⚙️ 配置选项

```ts
interface UserOptions {
  resolver: "vue" | "react"
  dirs?: string | PageDir[]
  extensions?: string[]
  caseSensitive?: boolean
  routeNameSeparator?: string
}
```

| 选项                   | 说明      | 默认值                                                              |
| -------------------- | ------- | ---------------------------------------------------------------- |
| `resolver`           | 框架类型    | 必填                                                               |
| `dirs`               | 页面目录    | `'src/pages'`                                                    |
| `extensions`         | 文件扩展名   | Vue: `['vue', 'ts', 'js']` / React: `['tsx', 'jsx', 'ts', 'js']` |
| `caseSensitive`      | 路径大小写敏感 | `false`                                                          |
| `routeNameSeparator` | 路由名称分隔符 | `'-'`                                                            |

## 🔨 示例项目

- [Vue + Vite](./examples/vue)
- [React + Vite](./examples/react)
- [Vue + Rspack](./examples/vue-rsbuild)
- [React + Rspack](./examples/react-rsbuild)

## 友情链接

- [unplugin](https://github.com/unjs/unplugin)
- [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)

