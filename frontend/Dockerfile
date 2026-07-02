# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Serve the production assets with Nginx
FROM nginx:alpine

# Install gettext so envsubst is available for runtime config templating
RUN apk add --no-cache gettext

# Copy nginx config as a template (envsubst will write the final default.conf at startup)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy React build output from builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# -----------------------------------------------------------------------
# Default environment variables
#   PORT             — Nginx listen port. Local Docker Compose maps 3000:3000,
#                      so the default stays 3000. Railway overrides this.
#   NGINX_BACKEND_URL — Where /api/ requests are proxied to.
#                      Default matches the Docker Compose service name so local
#                      development works without any docker-compose.yml changes.
#                      Railway: set to https://<your-backend>.up.railway.app
# -----------------------------------------------------------------------
ENV PORT=3000
ENV NGINX_BACKEND_URL=http://backend:5000

EXPOSE 3000

# At startup:
#   1. envsubst replaces ONLY ${PORT} and ${NGINX_BACKEND_URL} in the template,
#      leaving all nginx-internal variables ($uri, $host, etc.) untouched.
#   2. nginx starts in the foreground.
CMD ["/bin/sh", "-c", \
  "envsubst '${PORT} ${NGINX_BACKEND_URL}' \
    < /etc/nginx/conf.d/default.conf.template \
    > /etc/nginx/conf.d/default.conf \
  && nginx -g 'daemon off;'"]

