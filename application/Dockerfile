FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY index.ts ./

RUN npm run build

FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY --from=builder /app/build ./build

CMD ["node", "build/index.js"]