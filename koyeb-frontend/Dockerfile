FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port (sesuaikan dengan aplikasi Anda)
EXPOSE 3000

CMD [ "npm", "start" ]
