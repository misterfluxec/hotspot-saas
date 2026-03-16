FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare yarn@stable --activate 
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/dashboard/package*.json ./apps/dashboard/
COPY packages/db/package*.json ./packages/db/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/types/package*.json ./packages/types/
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Generar Prisma Client (ajusta la ruta si tu carpeta es 'database' en lugar de 'db')
RUN npx prisma generate --schema packages/db/prisma/schema.prisma

RUN cd apps/dashboard && npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/dashboard/server.js"]
