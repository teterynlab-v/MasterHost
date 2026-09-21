FROM node:22-alpine AS source
RUN npm install --global pnpm@10.17.1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.base.json ./
COPY apps apps
COPY packages packages
COPY worldpacks worldpacks
COPY game-assets game-assets
COPY universe-catalog universe-catalog
RUN pnpm install --frozen-lockfile

FROM source AS server
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["./node_modules/.bin/tsx", "apps/server/src/index.ts"]

FROM source AS web-build
ARG VITE_API_URL=/api
ARG VITE_WS_URL=
ENV VITE_API_URL=$VITE_API_URL VITE_WS_URL=$VITE_WS_URL
RUN pnpm --filter @masterhost/web build

FROM nginx:1.27-alpine AS web
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=6 CMD wget -qO- http://127.0.0.1/health >/dev/null || exit 1
