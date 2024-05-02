# Build stage
FROM node:20 AS builder
WORKDIR /usr/src/app 

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of your source code
COPY . .

RUN npx prisma generate
# Build your application
RUN npm run build
RUN npm install -g npx --force

# Production stage
FROM node:20-slim
WORKDIR /usr/src/app

# Install openssl and curl
RUN apt-get update -y && apt-get install -y openssl curl


# Define arguments for environment variables.
ARG CRM_ACCESS_TOKEN
ARG CRM_API_PORT
ARG CRM_BASE_URL
ARG CRM_DATABASE_URL
ARG CRM_HOST
ARG CRM_HOST_PORT
ARG CRM_JWT_SECRET
ARG REDIS_IP
ARG REDIS_PASSWORD
ARG REDIS_PORT
ARG NODE_ENV
# Set environment variables from arguments
ENV CRM_ACCESS_TOKEN=${CRM_ACCESS_TOKEN}
ENV CRM_API_PORT=${CRM_API_PORT}
ENV CRM_BASE_URL=${CRM_BASE_URL}
ENV CRM_DATABASE_URL=${CRM_DATABASE_URL}
ENV CRM_HOST=${CRM_HOST}
ENV CRM_HOST_PORT=${CRM_HOST_PORT}
ENV CRM_JWT_SECRET=${CRM_JWT_SECRET}
ENV REDIS_IP=${REDIS_IP}
ENV REDIS_PASSWORD=${REDIS_PASSWORD}
ENV REDIS_PORT=${REDIS_PORT}
ENV NODE_ENV=${NODE_ENV}


# Only copy over the built elements from the dist folder from the previous stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./
COPY --from=builder /usr/src/app/prisma ./prisma


RUN npx prisma generate


# Expose the port the app runs on
EXPOSE 3001

# Start the app
CMD [ "node", "main.js" ]
