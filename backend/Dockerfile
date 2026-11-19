# ──────────────────────────────────────────────────
# Stage 1: Build NestJS application
# ──────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code and compile TypeScript
COPY . .
RUN npm run build

# ──────────────────────────────────────────────────
# Stage 2: Production runtime image (lean & secure)
# ──────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Only copy and install production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

# Run as non-root user for security
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
