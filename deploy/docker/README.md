# blog-home-uniapp Docker（H5 本地试验）

与 Go 单体一起在 WSL 试验时，由 `blog-server-go/deploy/docker/docker-compose.monolith.yml` 构建本目录镜像。

单独构建：

```bash
docker build -t blog-home-uniapp:local --build-arg UNI_BUILD_MODE=docker .
docker run --rm -p 8008:80 blog-home-uniapp:local
```

- 构建 env：`env/.env.docker`（`VITE_*` 指向 `http://localhost:8000`）
- 静态站：nginx，根路径 `/`（非生产 `/blog-uniapp/`）
- 生产部署仍用 [`../pm2/README.md`](../pm2/README.md) 的 `pnpm run deploy`
