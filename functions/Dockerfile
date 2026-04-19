# Lore Master API — Node 22 + Prisma (PostgreSQL / Railway)
FROM node:22-bookworm-slim

WORKDIR /app

# prisma/ must exist before npm ci — postinstall runs prisma generate
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

ENV NODE_ENV=production
EXPOSE 8080

# Migrations then API (same as npm start — DATABASE_URL required at runtime)
CMD ["npm", "start"]
