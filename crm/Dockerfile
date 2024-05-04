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
ARG ACCESS_TOKEN
ARG API_PORT
ARG BASE_URL
ARG DATABASE_URL
ARG HOST
ARG HOST_PORT
ARG JWT_SECRET
ARG REDIS_IP
ARG REDIS_PASSWORD
ARG REDIS_PORT
ARG NODE_ENV
# Set environment variables from arguments
ENV ACCESS_TOKEN=${ACCESS_TOKEN}
ENV API_PORT=${API_PORT}
ENV BASE_URL=${BASE_URL}
ENV DATABASE_URL=${DATABASE_URL}
ENV HOST=${HOST}
ENV HOST_PORT=${HOST_PORT}
ENV JWT_SECRET=${JWT_SECRET}
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
