# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy everything and build for production
COPY . .
RUN npm run build

# Runtime stage — serve with nginx
FROM nginx:alpine AS runtime
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Custom nginx config to handle Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80