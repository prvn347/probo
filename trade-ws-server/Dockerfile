FROM node:20-alpine

WORKDIR /trade-ws-server

COPY package*.json ./

RUN npm install

COPY . .


RUN  npm run build

EXPOSE 8080
CMD [ "npm" ,"start"]