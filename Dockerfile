FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 7860

# Set environment variable for Hugging Face Spaces
ENV PORT=7860

# Start the application
CMD ["npm", "start"]
