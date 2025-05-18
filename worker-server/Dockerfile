FROM node:18-alpine

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Set environment variables
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/app.js"]
