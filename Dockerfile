# --- Builder Stage ---
FROM node:26-alpine AS builder

WORKDIR /app

# Run as the unprivileged node user (UID 1000) so the dev container,
# which mounts node_modules from this image, can write to it
RUN chown node:node /app
USER node

# Copy package files and install dependencies (cached layer)
COPY --chown=node:node package*.json ./
RUN npm install

# Copy the rest of the application code
COPY --chown=node:node . .

# Build the SvelteKit application
RUN npm run build

# --- Production Stage ---
FROM node:26-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/lib/backend/db/roles.ts ./src/lib/backend/db/roles.ts

EXPOSE 3000

# Chain the migration script before starting the server
CMD ["sh", "-c", "node scripts/migrate.ts && node build"]

