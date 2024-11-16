FROM node:20-alpine

WORKDIR /trade-ws-server

COPY ./trade-ws-server/package*.json ./

RUN npm install

COPY ./trade-ws-server .


RUN  npm run build

EXPOSE 8080
CMD [ "npm" ,"start"]