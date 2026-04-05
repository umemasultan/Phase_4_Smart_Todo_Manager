FROM node:18-slim

WORKDIR /app

# Copy API package files
COPY api/package*.json ./api/

# Install API dependencies
RUN cd api && npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Set environment variable for Hugging Face Spaces
ENV PORT=3000

# Start the API server
CMD ["node", "api/app/index.js"]
