FROM node:18-alpine

WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Add this to ensure Vite uses the correct host
ENV HOST=0.0.0.0