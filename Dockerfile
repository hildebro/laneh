# --- Builder Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies (cached layer)
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the SvelteKit application
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine

WORKDIR /app

# Copy only the built artifacts from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose the port your application runs on
EXPOSE 3000

# Start the application.  Use `node` and the entry point of your built app.
CMD ["node", "build"]
