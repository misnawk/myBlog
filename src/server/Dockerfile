# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags for better performance
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build with increased memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm ci --only=production --prefer-offline --no-audit

# Expose port
EXPOSE 4000

# Start server
CMD ["node", "dist/main"] 