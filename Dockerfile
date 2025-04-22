# Use the official lightweight Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the project
RUN npm run build

# Optionally prune dev dependencies after build (if you're using a monorepo or big deps)
# RUN npm prune --production

# Expose port for SSE transport
EXPOSE 3001

# Set the command to run the built server
CMD ["node", "build/index.js"]
