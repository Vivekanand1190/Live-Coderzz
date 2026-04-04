# Layer 1: Build the frontend
FROM node:20-alpine as builder

WORKDIR /app

# Copy only the frontend first for caching
COPY ./Frontend/package*.json ./Frontend/
RUN cd Frontend && npm install

COPY ./Frontend ./Frontend
RUN cd Frontend && npm run build

# Layer 2: Setup the production runner
FROM node:20-alpine

WORKDIR /app

# Copy backend for production
COPY ./Backend/package*.json ./
RUN npm install --production

COPY ./Backend ./

# Move the built frontend to the backend's public folder
COPY --from=builder /app/Frontend/dist ./public

# Environment variables
ENV PORT=3000
EXPOSE 3000

# Start the editor!
CMD ["node", "server.js"]