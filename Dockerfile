# ==============================================================================
# 🐳 AZURE-OPTIMIZED DOCKERFILE FOR UAM API - PRODUCTION READY
# ==============================================================================
# Multi-stage build for optimized Azure Container Registry deployment
# Enhanced with security best practices and Azure-specific optimizations
# 
# ✅ Features:
# - Multi-stage build for smaller production image
# - Security hardening with non-root user
# - Azure Container Registry optimization
# - Health checks for Azure Container Instances
# - Proper caching and layer optimization
# ==============================================================================

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Install build dependencies for Azure optimization  
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm ci && npm cache clean --force

# Copy the source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Production stage optimized for Azure
FROM node:18-alpine AS production

# Create non-root user for enhanced security in Azure
RUN addgroup -g 1001 -S nodejs && \
    adduser -S uamapi -u 1001

# Set the working directory
WORKDIR /app

# Install runtime dependencies including curl for health checks
RUN apk add --no-cache dumb-init curl

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=uamapi:nodejs /app/dist ./dist

# Create data directory with proper permissions for Azure persistent storage
RUN mkdir -p /app/data && chown uamapi:nodejs /app/data

# Copy data files if they exist
COPY --chown=uamapi:nodejs data/ ./data/

# Expose the port for Azure App Service
EXPOSE 3000

# Set environment variables for Azure production
ENV NODE_ENV=production
ENV PORT=3000
ENV AZURE_DEPLOYMENT=true

# Switch to non-root user for security
USER uamapi

# Enhanced health check for Azure Application Insights monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly in Azure containers
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Azure-specific metadata labels
LABEL maintainer="UAM API Team"
LABEL version="1.0.0"
LABEL description="User Access Management API optimized for Azure Container Registry"
LABEL azure.deployment.type="container"
LABEL azure.security.scan="enabled"
LABEL azure.monitoring="application-insights"
LABEL azure.scaling="horizontal"
