FROM postgres:14-alpine

# Set environment variables for PostgreSQL
ENV POSTGRES_DB=todo_app
ENV POSTGRES_USER=todo_user
ENV POSTGRES_PASSWORD=password123

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432