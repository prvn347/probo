FROM node:20-alpine

WORKDIR /db-server

COPY ./db-server/package*.json ./
COPY ./db-server/prisma ./

RUN npm install
COPY ./db-server .

RUN npx prisma generate client

RUN  npm run build

CMD [ "npm","start" ]
