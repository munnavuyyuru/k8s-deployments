# stage 1
FROM node:20-alpine AS builder

WORKDIR /app 

COPY package*.json ./

RUN npm ci

COPY . .

# stage 2
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 8001

CMD ["node", "server.js"]
 
