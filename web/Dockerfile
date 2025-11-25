# base image
FROM node:18.20.8-slim AS base

LABEL maintainer="hikafeng@163.com"

# Install dependencies only when needed
FROM base AS packages
WORKDIR /app/web

COPY package.json package-lock.json* ./

# 使用国内镜像加速（可选）
RUN npm config set registry https://registry.npmmirror.com/ \
    && npm ci --prefer-offline --no-audit --progress=false --sharp-binary-host=https://npmmirror.com/mirrors/sharp --sharp-libvips-binary-host=https://npmmirror.com/mirrors/sharp-libvips

# Build stage
FROM base AS builder
WORKDIR /app/web

COPY --from=packages /app/web/ .
COPY . .
COPY .env.docker .env
# 使用 standalone 模式构建
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM base AS production

ENV NODE_ENV=production
ENV EDITION=SELF_HOSTED
ENV DEPLOY_ENV=PRODUCTION
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
ENV PM2_INSTANCES=2

WORKDIR /app/web

# ✅ 只复制 standalone 产物
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./.next/static
COPY --from=builder /app/web/public ./public

# 添加入口脚本和 PM2 配置
COPY entrypoint.sh ./entrypoint.sh
COPY ecosystem.config.js ./ecosystem.config.js

# 安装 PM2
RUN npm install -g pm2 \
    && mkdir /.pm2 \
    && chown -R 1001:0 /.pm2 /app/web \
    && chmod -R g=u /.pm2 /app/web

ARG COMMIT_SHA
ENV COMMIT_SHA=${COMMIT_SHA}
USER 1001
EXPOSE 3000
ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]

# docker build -t hikafeng/chatbot-ui:latest -t hikafeng/chatbot-ui:v0.1.0 --build-arg COMMIT_SHA=$(git rev-parse HEAD) .