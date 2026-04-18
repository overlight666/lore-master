# Lore Master API — Node 22 + Prisma (PostgreSQL / Railway)
FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

ENV NODE_ENV=production
EXPOSE 8080

# Railway sets PORT; run migrations then start HTTP server
CMD ["sh", "-c", "npx prisma migrate deploy && node lib/server.js"]
