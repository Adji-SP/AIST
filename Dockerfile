# Multi-stage Dockerfile for React + Node.js + Python ML

# Stage 1: Python ML Environment
FROM python:3.11-slim AS python-base

WORKDIR /app/ml

# Install Python dependencies
COPY App/python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python ML code
COPY App/python/ .

# Stage 2: Node.js Backend
FROM node:18-alpine AS backend

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend code
COPY App/ ./App/
COPY server.js ./
COPY .env ./

# Stage 3: React Frontend Build
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy frontend source
COPY src/ ./src/
COPY public/ ./public/
COPY craco.config.js ./

# Build the React app
RUN npm run build

# Stage 4: Production Image
FROM node:18-alpine

WORKDIR /app

# Install Python for ML inference
RUN apk add --no-cache python3 py3-pip

# Copy Python ML environment from Stage 1
COPY --from=python-base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-base /app/ml /app/App/python

# Copy Node.js backend from Stage 2
COPY --from=backend /app/node_modules ./node_modules
COPY --from=backend /app/App ./App
COPY --from=backend /app/server.js ./
COPY --from=backend /app/package*.json ./

# Copy built frontend from Stage 3
COPY --from=frontend-build /app/build ./build

# Copy environment file
COPY .env .env

# Expose ports
EXPOSE 3001 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the backend server
CMD ["node", "server.js"]
