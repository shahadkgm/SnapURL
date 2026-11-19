# ──────────────────────────────────────────────────
# Stage 1: Build Vite React application
# ──────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Inject API base URL at build time (defaults to localhost:3000)
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle
RUN npm run build

# ──────────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ──────────────────────────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx html files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

