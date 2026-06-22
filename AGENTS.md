# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于文件系统的约定式路由插件，使用 `unplugin` 开发，支持 Vite 和 Rspack 构建工具，同时支持 React 和 Vue 框架。

核心功能：通过虚拟模块机制，将文件系统中的页面文件自动转换为路由配置，使用 `import.meta.glob` (Vite) 和 `import.meta.webpackContext` (Rspack) 实现零运行时依赖和 HMR 支持。

## 常用命令

```bash
# 开发模式（监听文件变化并构建）
pnpm dev

# 构建生产代码
pnpm build

# 运行测试
pnpm test

# 运行测试 UI
pnpm test:ui

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 代码检查并自动修复
pnpm lint:fix

# 运行 Vue 示例项目
pnpm play

# 运行 React 示例项目
pnpm play:react
```

## 核心架构

### 虚拟模块系统

插件的核心是虚拟模块机制，通过 unplugin 的 `resolveId` 和 `load` 钩子实现：

- **虚拟模块 ID**：`virtual:unplugin-convention-routes/vue`、`~pages`（Vue）；`virtual:unplugin-convention-routes/react`、`~react-pages`（React）
- **工作流程**：当用户导入虚拟模块时，`resolveId` 拦截并解析为内部 ID，`load` 钩子根据配置动态生成路由代码
- **关键实现**：`src/index.ts` 中的 `unpluginFactory` 函数

### 三层架构

1. **Core 层** (`src/core/`)
   - `types.ts`：核心类型定义，包括 `UserOptions`、`ResolvedOptions`、`PageDir` 等
   - `options.ts`：配置解析和规范化，将用户配置转换为内部使用的 `ResolvedOptions`
   - `path.ts`：路径解析工具，支持 Next.js 风格（`[id]`）和 Remix 风格（`$id`）的动态路由、捕获所有路由（`[...all]` / `$`）

2. **Resolvers 层** (`src/resolvers/`)
   - `index.ts`：路由生成器入口，根据 `resolver` 类型分发到对应的生成器
   - `vue.ts`：生成 Vue Router 格式的路由代码
   - `react.ts`：生成 React Router 格式的路由代码
   - `utils.ts`：公共工具函数，包括 glob 模式转换、正则表达式转义、文件过滤等

3. **Entry 层** (`src/`)
   - `index.ts`：unplugin 主入口和工厂函数
   - `vite.ts`：Vite 插件导出
   - `rspack.ts`：Rspack 插件导出

### 构建工具差异处理

**Vite**：
- 使用 `import.meta.glob('/src/pages/**/*.vue')` 生成动态导入
- 支持相对路径和绝对路径（基于项目根目录）

**Rspack**：
- 使用 `import.meta.webpackContext(absolutePath, { recursive: true, regExp: /\.(vue|ts|js)$/ })` 生成动态导入
- **必须使用绝对路径**，否则虚拟模块中相对路径会有问题
- 在 `src/core/path.ts` 的 `getWebpackContextPattern` 函数中处理路径拼接

### 路由约定规则

支持多种文件命名风格，通过 `src/core/path.ts` 中的路径解析函数实现：

- **基础路由**：`index.vue` → `/`，`about.vue` → `/about`
- **嵌套路由**：`about/index.vue` → `/about`
- **动态路由**：`[id].vue` 或 `$id.vue` → `/:id`
- **捕获所有**：`[...all].vue` 或 `$.vue` → `/:all(.*)*`
- **忽略路由**：`__xxx__` 目录/文件会被忽略（如 `__tests__`）

## 测试

测试文件位于 `test/` 目录，使用 Vitest：

- `test/**/*.spec.ts`：所有测试文件
- 运行单个测试：`pnpm test path.spec.ts`
- 测试覆盖主要模块：options、path、utils、generate、index

## 重要注意事项

### 代码规范

- **所有代码需要添加中文注释**，包括函数、类型定义、关键逻辑
- 使用 ESLint (@antfu/eslint-config) 进行代码检查
- 提交前务必运行 `pnpm lint` 和 `pnpm type-check`

### Rspack 路径问题

Rspack 虚拟模块中相对路径会出问题，必须使用绝对路径。在 `getWebpackContextPattern` 函数中，通过拼接 `root + dirPath` 生成完整的绝对路径。

### 正则表达式性能优化

`src/resolvers/utils.ts` 中的正则表达式已移至模块作用域，避免每次调用重新编译。添加新的正则时也应遵循此模式。

### 虚拟模块 ID 过滤

使用 `createExactIdFilter` 函数创建精确匹配的正则表达式，避免误匹配其他模块 ID。该函数会对每个 ID 进行正则转义后拼接为 `^(?:id1|id2)$` 格式。

### 钩子函数执行时机

- `extendRoute`：每个路由生成时调用，可修改单个路由配置
- `onRoutesGenerated`：所有路由生成完成后调用，可批量修改路由数组
- `onClientGenerated`：客户端代码生成完成后调用，可修改最终生成的代码字符串
