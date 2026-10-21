FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

EXPOSE 8087
CMD ["npm", "run", "dev"]