# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY src/client/package*.json ./src/client/
COPY src/server/package*.json ./src/server/

# Install dependencies
RUN npm install
RUN cd src/client && npm install
RUN cd src/server && npm install

# Copy source code
COPY . .

# Build client
RUN cd src/client && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built client files
COPY --from=builder /app/src/client/build ./src/client/build

# Copy server files
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/src/server/package*.json ./src/server/

# Install production dependencies
RUN cd src/server && npm install --production

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start server
CMD ["node", "src/server/dist/main"] 