# Simple Node.js 18 Docker image for Cloud Run
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the entire src directory (already has index.ts compiled if needed)
COPY . .

# Expose port 8080
EXPOSE 8080

# Set environment
ENV PORT=8080
ENV NODE_ENV=production

# Start the application
CMD ["node", "--require", "ts-node/register", "src/index.ts"]
