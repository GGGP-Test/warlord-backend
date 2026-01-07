# Use Node.js 18 base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy functions folder
COPY functions ./functions

# Expose port 8080 (Cloud Run expects this)
EXPOSE 8080

# Set environment variable
ENV PORT=8080

# Start the server
CMD ["node", "functions/index.js"]