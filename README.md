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
| `pnpm run deploy` | H5 一键部署到生产（见下方） |
| `pnpm run rollback` | 回滚上一版 H5 静态包 |
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
│   ├── pages-blog/       # 分包：阅读 / 用户内容
│   ├── pages-rpg/        # 分包：RPG 冒险
│   ├── pages-tool/       # 分包：实用工具
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

## 分包与 TabBar

| 分包 root | 说明 | 代表页面 |
| --- | --- | --- |
| `src/pages/` | 主包（冷启动 + TabBar） | index、detail、search、explore、rpg/entry、me、auth、about |
| `src/pages-blog/` | 阅读 / 用户（按需加载） | archives、user/profile |
| `src/pages-rpg/` | RPG 冒险（按需加载） | index、guide |

**TabBar（4 项）**：首页 · 发现 · 冒险（entry 壳页）· 我的。完整 RPG 在 `pages-rpg/index/index`，由 entry 页 `navigateTo` 进入。

**与 blog-home-nuxt 路径对照**：

| uniapp | Nuxt |
| --- | --- |
| `/pages/index/index` | `/` |
| `/pages/detail/detail?id=` | `/detail/:id` |
| `/pages/search/search` | `/search` |
| `/pages/explore/explore` | `/explore` |
| `/pages/rpg/entry` | Tab 入口（Web 无对应） |
| `/pages-rpg/index/index` | `/rpg` |
| `/pages-blog/user/profile` | `/user/profile` |
| `/pages-blog/archives/index` | `/archives` |
| `/pages-blog/projects/index` | `/projects` |
| `/pages-blog/features/index` | `/features` |
| `/pages/404/index` | 404 页 |

## 常用页面

| 路径 | 说明 |
| --- | --- |
| `/pages/index/index` | 首页文章列表 |
| `/pages/detail/detail?id=` | 文章详情（目录、代码高亮、打赏） |
| `/pages/search/search` | 搜索 |
| `/pages/explore/explore` | 发现（站点浏览、社区互动与工具入口） |
| `/pages/auth/login` | 登录 |
| `/pages/auth/register` | 注册 |
| `/pages/me/me` | 我的（账号卡片、个人中心功能菜单） |
| `/pages/rpg/entry` | RPG Tab 入口 |
| `/pages-rpg/index/index` | 冒险中心（五 Tab） |
| `/pages-rpg/guide/index` | RPG 玩法说明 |
| `/pages-blog/archives/index` | 文章归档 |
| `/pages-blog/tag/list?id=` | 标签文章 |
| `/pages-blog/category/list?id=` | 分类文章 |
| `/pages-blog/user/profile` | 个人中心 |
| `/pages-blog/user/article/edit` | 写文章 / 编辑 |
| `/pages-blog/user/public?uid=` | 公开主页 |
| `/pages-blog/msgboard/index` | 留言板（楼中楼、管理员删除） |
| `/pages-blog/projects/index` | 项目展示 |
| `/pages-blog/features/index` | 系统特性 |
| `/pages/404/index` | 404 页面不存在 |
| `/pages-blog/links/index` | 友链 |
| `/pages-blog/open-source/index` | 开源与合作 |
| `/pages-tool/index/index` | 工具箱 |
| `/pages-tool/codes/index` | 条形/二维码 |
| `/pages-tool/rsa/index` | RSA 加解密 |
| `/pages-tool/crypto/index` | 对称加密（AES/DES） |
| `/pages-tool/sm/index` | 国密 SM2 |
| `/pages-tool/qrcode/index` | 二维码（重定向至 codes） |
| `/pages-tool/ai-summary/index` | AI 文章摘要 |
| `/pages-tool/ai/index` | AI 对话 |
| `/pages-tool/watermark/index` | 批量水印 |
| `/pages-tool/photos/index` | 光影边框 |
| `/pages-tool/audio-visualized/index` | 音频可视化 |
| `/pages-tool/upload-slice/index` | 切片上传 |
| `/pages-tool/other/index` | 其他工具 |
| `/pages-tool/test/index` | 开发测试 |
| `/pages-tool/pdf/index` | PDF 电子签名 |
| `/pages-tool/h5-web/index` | Web 工具外链兜底 |
| `/pages/about/about` | 关于 |

路由常量见 `src/router/routes.ts`；发现页分区见 `src/config/quick-entries.ts`，我的页菜单见 `src/config/me-menu.ts`。

## 冒险中心（RPG）

与 blog-home-nuxt `/rpg` 功能对齐，组件位于 `src/components/rpg/`：

| Tab | 能力 |
| --- | --- |
| 状态 | 签到、等级奖励路线图、抽奖宝箱（单/十连动画）、任务分组、成就、Buff、赛季/天气 Banner、命中记录 |
| 背包 | 类型筛选、穿戴称号/头像框、充值入口 |
| 宠物 | 宠物蛋孵化、钻石兑换、出战/休息、改名 |
| 公会 | 创建/加入/退出、成员列表 |
| 排行 | 五维度 × 四周期、跳转公开主页 |

全站 `RpgGlobalInit`（`App.vue`）登录后连接 Socket.IO，WS 庆祝动画（升级/成就/抽奖/社交等）与 Nuxt 同级。音效：`use-rpg-audio`（InnerAudioContext + H5 合成 fallback），冒险页可开 BGM。静态图标：`static/rpg/icons/`。WXSS 须遵守 `.cursor/rules/uniapp-21-wxss-forbidden-css.mdc`，改样式后请在微信开发者工具编译验证。

## 一键部署（H5 生产）

与 blog-admin 同机：`/opt/jxapp/front/blog-uniapp` → 主域 `https://jiang-xia.top/blog-uniapp/`（Nginx 见 `blog-server/deploy/nginx/conf.d/jiang-xia.top.conf`）

```powershell
pnpm run deploy
```

build 读 `env/.env.production`；SSH 见 `deploy/pm2/deploy.local.env`（从 `deploy.local.env.example` 复制）。详见 [deploy/pm2/README.md](deploy/pm2/README.md)。

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
