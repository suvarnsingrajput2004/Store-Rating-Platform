FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy rest of the application files
COPY . .

# Default to production; Railway will inject its own NODE_ENV as well
ENV NODE_ENV=production

# Expose default backend port (Railway overrides PORT at runtime)
EXPOSE 5000

# Health check — uses dynamic PORT so it works locally (5000) and on Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e \
    "fetch('http://localhost:' + (process.env.PORT || 5000) + '/api/v1/health') \
      .then(r => r.ok ? process.exit(0) : process.exit(1)) \
      .catch(() => process.exit(1))"

# Run the app
CMD [ "node", "server.js" ]
