# Build stage
FROM ghcr.io/zautoai/node:20-builder AS builder

# Copy the rest of your source code
COPY . .

# Build your application
RUN npm run build:prod
RUN npm install -g npx --force

# Production stage
FROM ghcr.io/zautoai/node:20-alpine-prod

# Set NODE_ENV to development (or production based on your environment)
ENV NODE_ENV=prod

# Define arguments for environment variables.
ARG REDIS_IP
ARG REDIS_PASSWORD
ARG REDIS_PORT
ARG CRM_DATABASE_URL
ARG CRM_JWT_SECRET

# Set environment variables from arguments
ENV REDIS_IP=${REDIS_IP}
ENV REDIS_PASSWORD=${REDIS_PASSWORD}
ENV REDIS_PORT=${REDIS_PORT}
ENV CRM_DATABASE_URL=${CRM_DATABASE_URL}
ENV CRM_JWT_SECRET=${CRM_JWT_SECRET}

# Rest of your Dockerfile instructions...



# Only copy over the built elements from the dist folder from the previous stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/public/ ../public

RUN npx prisma generate

WORKDIR /usr/src/

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD [ "node", "app/main.js" ]
