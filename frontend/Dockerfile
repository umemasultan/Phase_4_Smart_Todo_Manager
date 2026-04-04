# Use nginx to serve static files
FROM nginx:alpine

# Copy static HTML files
COPY index.html /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]