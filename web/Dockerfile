FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application files
COPY . .

# Build the Next.js application
# We set this environment variable to ensure production build optimizations
ENV NODE_ENV=production
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]
