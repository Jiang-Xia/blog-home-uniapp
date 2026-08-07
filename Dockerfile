# blog-home-uniapp H5 静态镜像（本地 Docker 试验；生产仍用 pnpm deploy + Nginx 宿主）
# 构建参数 UNI_BUILD_MODE 对应 env/.env.<mode>（默认 docker → 直连 localhost:8000）

FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# 必须先带上 .npmrc（shamefully-hoist / auto-install-peers），否则 md-editor-v3 等同包 peer 解析失败
COPY package.json pnpm-lock.yaml .npmrc ./
# husky / gen-icons 等 prepare 在镜像内易失败，先装依赖再显式生成
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
ARG UNI_BUILD_MODE=docker
ENV UNI_BUILD_MODE=${UNI_BUILD_MODE}
# 图标等为构建前置；失败不阻断（仓库内通常已有产物）
RUN pnpm gen:icons || true
RUN pnpm gen:launcher-icons || true
# @uni-helper/vite-plugin-uni-platform 在 H5 会解析 @/types/rpg → rpg.h5；仓库通常只有 rpg.ts
RUN if [ -f src/types/rpg.ts ] && [ ! -f src/types/rpg.h5.ts ]; then cp src/types/rpg.ts src/types/rpg.h5.ts; fi
RUN pnpm exec uni build --mode ${UNI_BUILD_MODE}

FROM nginx:1.27-alpine
COPY deploy/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/build/h5 /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
