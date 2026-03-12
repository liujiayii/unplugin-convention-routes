<p align="center">
  <a href="https://www.npmjs.org/package/unplugin-convention-routes">
    <img src="https://img.shields.io/npm/v/unplugin-convention-routes.svg" alt="npm version">
  </a>
  <a href="https://npmcharts.com/compare/unplugin-convention-routes?minimal=true">
    <img src="https://img.shields.io/npm/dm/unplugin-convention-routes.svg" alt="npm downloads">
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

### 完整类型定义

```ts
interface UserOptions {
  /** 路由解析器类型（必填） */
  resolver: "vue" | "react"
  /** 页面目录配置 */
  dirs?: string | PageDir[]
  /** 文件扩展名 */
  extensions?: string[]
  /** 排除的文件模式 */
  exclude?: string[]
  /** 导入路径风格 */
  importPath?: "absolute" | "relative"
  /** 路径大小写敏感 */
  caseSensitive?: boolean
  /** 路由名称分隔符 */
  routeNameSeparator?: string
  /** 扩展路由配置的钩子函数 */
  extendRoute?: (route: any, parent: any | undefined) => any | void
  /** 路由生成后的钩子函数 */
  onRoutesGenerated?: (routes: any[]) => Awaitable<any[] | void>
  /** 客户端代码生成后的钩子函数 */
  onClientGenerated?: (clientCode: string) => Awaitable<string | void>
}

interface PageDir {
  /** 目录路径 */
  dir: string
  /** 基础路由前缀 */
  baseRoute?: string
  /** 文件匹配模式 */
  filePattern?: string
}
```

### 基础配置选项

| 选项                   | 说明                              | 默认值                                                              |
| -------------------- | ------------------------------- | ---------------------------------------------------------------- |
| `resolver`           | 框架类型，支持 `vue` 或 `react`         | **必填**                                                           |
| `dirs`               | 页面目录配置，支持字符串或数组格式               | `'src/pages'`                                                    |
| `extensions`         | 文件扩展名列表                         | Vue: `['vue', 'ts', 'js']` / React: `['tsx', 'jsx', 'ts', 'js']` |
| `exclude`            | 排除的文件模式列表                       | `['node_modules', '.git', '**/__*__/**', '**/components/**', '**/components.*']` |
| `caseSensitive`      | 路径是否大小写敏感                       | `false`                                                          |
| `routeNameSeparator` | 路由名称分隔符                         | `'-'`                                                            |
| `importPath`         | 导入路径风格，`absolute` 或 `relative` | `'relative'`                                                     |

---

### `resolver`（必填）

指定路由解析器类型，决定生成的路由代码格式。

```ts
Pages({
  resolver: "vue", // 生成 Vue Router 格式的路由
})

Pages({
  resolver: "react", // 生成 React Router 格式的路由
})
```

---

### `dirs`

配置页面目录，支持字符串或数组格式。

#### 单目录配置（字符串）

```ts
Pages({
  resolver: "vue",
  dirs: "src/pages", // 默认值
})
```

#### 多目录配置（数组）

当项目有多个页面目录时，可以使用数组配置：

```ts
Pages({
  resolver: "vue",
  dirs: [
    // 主页面目录
    { dir: "src/pages", baseRoute: "" },
    // 功能模块页面目录，所有路由添加 /features 前缀
    { dir: "src/features/**/pages", baseRoute: "features" },
    // 管理后台页面目录，所有路由添加 /admin 前缀
    { dir: "src/admin/pages", baseRoute: "admin" },
  ],
})
```

**`PageDir` 配置项说明：**

| 属性           | 说明                   | 示例                      |
| ------------ | -------------------- | ----------------------- |
| `dir`        | 目录路径，支持 glob 模式      | `'src/pages'`            |
| `baseRoute`  | 基础路由前缀，所有路由会添加此前缀    | `'admin'` → `/admin/...` |
| `filePattern` | 文件匹配模式，用于进一步筛选文件（可选） | `'**/*.vue'`             |

---

### `extensions`

指定要识别的文件扩展名。

```ts
Pages({
  resolver: "vue",
  extensions: ["vue"], // 只识别 .vue 文件
})

Pages({
  resolver: "react",
  extensions: ["tsx", "jsx"], // 只识别 .tsx 和 .jsx 文件
})
```

---

### `exclude`

排除不需要生成路由的文件或目录。使用 [minimatch](https://github.com/isaacs/minimatch) 模式匹配。

**默认排除列表：**
- `node_modules` - 依赖目录
- `.git` - Git 目录
- `**/__*__/**` - 测试相关目录（如 `__tests__`、`__mocks__`）
- `**/components/**` - components 目录
- `**/components.*` - components 文件（如 `components.vue`、`components.tsx`）

```ts
// 自定义排除列表（会覆盖默认值）
Pages({
  resolver: "vue",
  exclude: [
    "node_modules",
    ".git",
    "**/__*__/**",
    "**/components/**",
    "**/*.test.*", // 排除测试文件
    "**/*.spec.*",
  ],
})
```

---

### `importPath`

控制组件导入路径的风格。

| 值          | 说明                     | 示例                                      |
| ----------- | ------------------------ | ----------------------------------------- |
| `'relative'` | 相对路径（默认）           | `'./pages/index.vue'`                     |
| `'absolute'` | 绝对路径（基于项目根目录） | `'/src/pages/index.vue'`                  |

```ts
Pages({
  resolver: "vue",
  importPath: "absolute", // 使用绝对路径
})
```

---

### `caseSensitive`

控制路由路径是否大小写敏感。

```ts
Pages({
  resolver: "vue",
  caseSensitive: true, // /About 和 /about 是不同的路由
})
```

---

### `routeNameSeparator`

设置路由名称的分隔符，用于从文件路径生成路由名称。

```ts
// 文件路径: src/pages/blog/[id].vue
// 默认分隔符 '-': 路由名称为 'blog-id'

Pages({
  resolver: "vue",
  routeNameSeparator: "_", // 路由名称变为 'blog_id'
})
```

---

### 高级钩子函数

#### `extendRoute`

扩展或修改单个路由配置。在每个路由生成时调用。

```ts
Pages({
  resolver: "vue",
  extendRoute: (route, parent) => {
    // 为所有路由添加 meta 信息
    route.meta = {
      ...route.meta,
      title: route.name,
    }

    // 为特定路由添加额外配置
    if (route.path === "/admin") {
      route.meta = { requiresAuth: true }
    }

    // 返回修改后的路由（或返回 void 保持原引用）
    return route
  },
})
```

**参数说明：**
- `route` - 当前路由配置对象
- `parent` - 父路由配置（如果是嵌套路由）

---

#### `onRoutesGenerated`

在所有路由生成完成后调用，可以批量修改路由数组。

```ts
Pages({
  resolver: "vue",
  onRoutesGenerated: async (routes) => {
    // 添加全局路由（如 404 页面）
    routes.push({
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: "() => import('./src/pages/404.vue')",
    })

    // 过滤掉某些路由
    return routes.filter(route => !route.path.startsWith("/draft"))
  },
})
```

---

#### `onClientGenerated`

在客户端代码生成完成后调用，可以修改最终生成的代码字符串。

```ts
Pages({
  resolver: "vue",
  onClientGenerated: (clientCode) => {
    // 在代码开头添加注释
    const header = "// 自动生成的路由文件，请勿手动修改\n"
    return header + clientCode
  },
})
```

---

## 🔨 示例项目

- [Vue + Vite](./examples/vue-vite)
- [React + Vite](./examples/react-vite)
- [Vue + Rspack](./examples/vue-rsbuild)
- [React + Rspack](./examples/react-rsbuild)

## 友情链接

- [unplugin](https://github.com/unjs/unplugin)
- [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)
