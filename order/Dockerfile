# Order Service Dockerfile
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy source code
COPY . .

# Expose port
EXPOSE 3002

# Start the service
CMD ["npm", "start"]