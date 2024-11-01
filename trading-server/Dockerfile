FROM node:20-alpine

WORKDIR /backend

COPY package*.json ./


RUN npm install
COPY . .


RUN npm run build

EXPOSE 3000

CMD [ "npm","start" ]