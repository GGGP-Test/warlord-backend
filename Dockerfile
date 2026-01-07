# Multi-stage build: Build stage and Runtime stage
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev)
# Using npm install (not npm ci) since we don't have package-lock.json
RUN npm install

# Copy source files
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# ===== Runtime Stage =====
FROM node:18-slim

WORKDIR /app

# Copy package files from builder
COPY package*.json ./

# Install ONLY production dependencies
# Using npm install --only=production (for npm v6 compatibility)
RUN npm install --only=production && npm cache clean --force

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Expose port 8080
EXPOSE 8080

# Set environment
ENV PORT=8080
ENV NODE_ENV=production

# Start the application with compiled JavaScript (not TypeScript)
CMD ["node", "dist/index.js"]
