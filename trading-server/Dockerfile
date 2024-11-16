FROM node:20-alpine

WORKDIR /backend

COPY ./trading-server/package*.json ./


RUN npm install
COPY ./trading-server .


RUN npm run build

EXPOSE 3000

CMD [ "npm","start" ]