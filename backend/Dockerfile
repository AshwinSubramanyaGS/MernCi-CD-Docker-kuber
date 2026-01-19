# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for building)
RUN npm ci

# Copy source code
COPY . .

# ---------- Production Stage ----------
FROM node:20-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules

# Copy necessary config files
COPY .env.example ./

# Change ownership to non-root user
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "const http = require('http'); const options = {host: 'localhost', port: 5000, path: '/api/v1/health', timeout: 2000}; http.get(options, (res) => {if(res.statusCode !== 200) process.exit(1);}).on('error', () => process.exit(1));"

EXPOSE 5000

CMD ["node", "src/app.js"]