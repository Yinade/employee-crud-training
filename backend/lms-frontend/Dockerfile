# FROM node:16-alpine

# # Set the working directory
# WORKDIR /app

# # Copy package.json and yarn.lock
# COPY package.json yarn.lock ./

# # Install dependencies
# RUN yarn install

# # Copy the rest of the application files
# COPY . .

# # Expose port (Vite's default port is 5173)
# EXPOSE 5173

# # Command to run the application
# CMD ["yarn", "dev"]


#the second test

# # Stage 1: Build the React app
# FROM node:16-alpine AS build

# # Set the working directory
# WORKDIR /app

# # Copy package.json and yarn.lock
# COPY package.json yarn.lock ./

# # Install dependencies
# RUN yarn install

# # Copy the rest of the application files
# COPY . .

# # Build the React app for production
# RUN yarn build

# # Stage 2: Set up Nginx to serve the React app
# FROM nginx:alpine

# # Copy the build output from the build stage to Nginx's html folderdf
# COPY --from=build /app/dist /usr/share/nginx/html

# # Expose port 80 (standard for HTTP)
# EXPOSE 80

# # Start Nginx
# CMD ["nginx", "-g", "daemon off;"]


#the third test
# Use Node.js 20 (instead of 16)
# Use the latest stable Node.js 20 Alpine image
# FROM node:20-alpine

# # Set the working directory inside the container
# WORKDIR /app

# # Copy package.json and yarn.lock first (for caching dependencies)
# COPY package.json yarn.lock ./

# # Configure Yarn for better network stability
# RUN yarn config set network-timeout 300000
# RUN yarn config set registry https://registry.npmmirror.com

# # Install dependencies
# RUN yarn install --frozen-lockfile --non-interactive

# # Copy the rest of the application files
# COPY . .

# # Expose port (Vite's default port is 5173)
# EXPOSE 5173

# # Command to start the application
# CMD ["yarn", "dev"]

#forthone changed for the local Kubernetes staging 

# # Use the latest stable Node.js 20 Alpine image as builder
# FROM node:20-alpine AS builder

# # Set the working directory inside the container
# WORKDIR /app

# # Copy package.json and yarn.lock first (for caching dependencies)
# COPY package.json yarn.lock ./

# # Configure Yarn for better network stability
# RUN yarn config set network-timeout 300000
# RUN yarn config set registry https://registry.npmmirror.com

# # Install dependencies, ensuring devDependencies are included
# RUN yarn install --frozen-lockfile --non-interactive

# # 🔹 Ensure TypeScript is installed globally
# RUN yarn global add typescript

# # Copy the rest of the application files
# COPY . .

# # 🔹 Ensure all executables in node_modules/.bin have execution permissions
# RUN chmod -R +x node_modules/.bin

# # Build the frontend (static files)
# RUN yarn build

# # ---- Production Image ----
# FROM nginx:stable-alpine

# # Set working directory
# WORKDIR /usr/share/nginx/html

# # Remove default nginx static files
# RUN rm -rf ./*

# # Copy built frontend from the builder stage
# COPY --from=builder /app/dist .

# # Expose port 80 for serving static files
# EXPOSE 80

# # Start Nginx
# CMD ["nginx", "-g", "daemon off;"]

#docker from grok

# Build stage
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock first (for caching dependencies)
COPY package.json yarn.lock ./

# Configure Yarn for better network stability
RUN yarn config set network-timeout 300000
RUN yarn config set registry https://registry.npmmirror.com

# Install dependencies, ensuring devDependencies are included
RUN yarn install --frozen-lockfile --non-interactive

# Ensure TypeScript is installed globally
RUN yarn global add typescript

# Copy the rest of the application files
COPY . .

# Ensure all executables in node_modules/.bin have execution permissions
RUN chmod -R +x node_modules/.bin

# Build the frontend (static files)
RUN yarn build

# Production stage
FROM nginx:stable-alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default Nginx static files
RUN rm -rf ./*

# Copy built frontend from the builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for serving static files
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]