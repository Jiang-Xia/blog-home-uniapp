# blog-home-uniapp H5 一键部署

## 命令

```powershell
pnpm run deploy
```

静态目录：`/opt/jxapp/front/blog-uniapp` → 线上访问 `https://jiang-xia.top/blog-uniapp/`

## 配置

| 文件 | 说明 |
|------|------|
| `env/.env.production` | uni-app H5 生产 build，**直接读这个** |
| `deploy/pm2/deploy.local.env` | SSH（gitignore） |

可选：`DEPLOY_BACKUP_KEEP=5`、`DEPLOY_RELEASE_KEEP=5`

## 目录结构（方案 B，零停机）

```text
/opt/jxapp/front/blog-uniapp/
  current -> releases/20260622-143000/   # Nginx root 应指向 current
  releases/
    20260622-143000/                     # index.html、assets/…
    backups/
```

**Nginx**（主域 `jiang-xia.top.conf`，与 `/zone/` 同级）：

```nginx
location /blog-uniapp/ {
    alias /opt/jxapp/front/blog-uniapp/current/;
    try_files $uri $uri/ /blog-uniapp/index.html;
}
```

生产 build 须设 `env/.env.production` 中 `VITE_APP_PUBLIC_BASE=/blog-uniapp/`（与 location 前缀一致）。首次部署后若仍是扁平目录，脚本会自动迁移并创建 `current`。

## 流程

1. 读 `env/.env.production` → `pnpm run build:prod`（产物在 `dist/build/h5/`）
2. 备份当前 active release → 打包 H5 dist → tar → 上传
3. 解压到新 `releases/时间戳/` → 切换 `current` 软链（旧版继续服务至切换瞬间）

无 PM2，env 不打进 tar（已编译进 JS）。

## 回滚

```powershell
pnpm run rollback:list
pnpm run rollback
pnpm run rollback -- -BackupName backup-20250621-143022.tar.gz
```

FinalShell：`/opt/jxapp/front/blog-uniapp/releases/`

## 与 blog-admin 的差异

| 项 | blog-admin | blog-home-uniapp |
| --- | --- | --- |
| 包管理 | npm | pnpm |
| 生产 env | 根目录 `.env.production` | `env/.env.production` |
| 构建命令 | `npm run build` | `pnpm run build:prod` |
| 产物目录 | `dist/` | `dist/build/h5/` |
