FROM gplane/pnpm:9-node22-alpine AS base
WORKDIR /app

# Установка зависимостей
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Копирование исходного кода и сборка проекта
COPY . .
ARG DATABASE_URI
ENV DATABASE_URI=${DATABASE_URI}
RUN pnpm db:push
RUN pnpm build

# Установка только production зависимостей
RUN pnpm prune --prod

# Запуск приложения
ENV NODE_ENV=production
CMD ["node", "dist/src/server.js"]