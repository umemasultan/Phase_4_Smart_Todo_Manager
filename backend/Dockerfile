# Use official Node.js runtime as parent image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application code
COPY . .

# Expose port 8080
EXPOSE 8080

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S todouser -u 1001

# Change ownership of app directory
RUN chown -R todouser:nodejs /app
USER todouser

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["npm", "start"]