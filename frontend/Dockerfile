FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY backend/prisma backend/prisma
COPY frontend/package.json frontend/package.json
RUN npm install

COPY frontend frontend
WORKDIR /app/frontend

EXPOSE 3000

CMD ["npm", "run", "dev"]
