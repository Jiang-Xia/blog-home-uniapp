<div align="center">
  <h1>Blog Home UniApp</h1>
  <p>博客移动端 — 基于 uni-app + Vue3 + TypeScript + Vite 的跨端前台</p>
</div>

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite)](https://vitejs.dev/)

> **三端说明**：本仓库为博客 **移动端 / 小程序** 前台，基于 [unibest](https://unibest.tech) 脚手架；与 [blog-home-nuxt](https://github.com/Jiang-Xia/blog-home-nuxt)（Web 前台）、[blog-admin](https://github.com/Jiang-Xia/blog-admin)（管理后台）配套；后端 **blog-server 闭源**。

## 项目简介

Blog Home UniApp 是博客三端架构中的**移动端前台**，目标对齐 blog-home-nuxt 的页面域（阅读、用户、RPG、工具），支持 H5、微信小程序、App 等多端发布。

| 端 | 仓库 | 默认端口 |
| --- | --- | --- |
| Web 前台 | blog-home-nuxt | 5050 |
| 管理后台 | blog-admin | 9856 |
| 移动端 | **blog-home-uniapp** | 9000 |
| 后端 API | blog-server | 5000 |

## 技术栈

- **框架**：uni-app 3 + Vue 3 + TypeScript
- **构建**：Vite 5 + `@dcloudio/vite-plugin-uni`
- **样式**：UnoCSS + wot-ui
- **状态**：Pinia + persistedstate
- **请求**：Alova / 自封装 HTTP
- **工程化**：ESLint 9、Commitlint、Husky、lint-staged、EditorConfig

## 环境要求

- Node.js >= 20
- pnpm >= 9
- 微信开发者工具（开发小程序时）

## 快速开始

```bash
pnpm install
pnpm dev          # H5，默认 http://localhost:9000
pnpm dev:mp       # 微信小程序 → 导入 dist/dev/mp-weixin
pnpm dev:app      # App（需 HBuilderX 或模拟器）
```

联调本地 blog-server 时，在 `env/.env.development` 配置：

```env
VITE_SERVER_BASEURL = 'http://localhost:5000/api/v1'
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` / `pnpm dev:h5` | H5 开发 |
| `pnpm dev:mp` | 微信小程序开发 |
| `pnpm build` | 生产构建（H5） |
| `pnpm build:mp` | 微信小程序生产构建 |
| `pnpm lint` | ESLint 检查 |
| `pnpm lint:fix` | ESLint 自动修复 |
| `pnpm type-check` | Vue TSC 类型检查 |
| `pnpm test` | Vitest 单元测试 |

## 目录结构

```
blog-home-uniapp/
├── env/                  # 环境变量（.env.*）
├── src/
│   ├── pages/            # 主包页面（约定式路由）
│   ├── api/              # 接口封装
│   ├── http/             # 请求层
│   ├── store/            # Pinia
│   ├── tabbar/           # 自定义 TabBar
│   └── layouts/          # 布局
├── manifest.config.ts    # uni-app 应用清单（生成 manifest.json）
├── pages.config.ts       # 页面与 TabBar 配置（生成 pages.json）
├── vite.config.ts        # Vite 构建
├── eslint.config.mjs     # ESLint 扁平配置
└── commitlint.config.js  # 提交信息校验
```

## Git 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)，**subject 使用简体中文**：

```
<type>(<scope>): <中文简述>
```

示例：`chore: 初始化项目结构与工程化配置`

详见 `.husky/note.md` 与 `.cursor/rules/uniapp-18-commit-message.mdc`。

## 核心配置文件

| 文件 | 说明 |
| --- | --- |
| `vite.config.ts` | Vite + uni 插件、分包、代理 |
| `manifest.config.ts` | AppID、小程序、H5 base 等 |
| `pages.config.ts` | 全局样式、easycom、TabBar |
| `eslint.config.mjs` | `@uni-helper/eslint-config` |
| `uno.config.ts` | UnoCSS 原子化样式 |

## 许可证

[MIT](./LICENSE)
