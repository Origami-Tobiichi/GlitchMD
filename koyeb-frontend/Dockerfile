FROM node:18-alpine

WORKDIR /app

# Copy package files FIRST (for better caching)
COPY package*.json ./

# Check if package.json exists and install dependencies
RUN if [ ! -f package.json ]; then echo "ERROR: package.json not found!" && exit 1; fi && \
    npm install --omit=dev

# Copy source code
COPY . .

# Create public directory if it doesn't exist
RUN mkdir -p public

# Verify the structure
RUN echo "✅ Current directory structure:" && ls -la && \
    echo "✅ Public directory:" && ls -la public/ 2>/dev/null || echo "⚠️ Public directory is empty"

EXPOSE 3000

# Health check (simplified)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]
