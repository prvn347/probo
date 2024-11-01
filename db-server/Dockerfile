FROM node:20-alpine

WORKDIR /db-server

COPY package*.json ./
COPY prisma ./

RUN npm install
COPY . .

RUN npx prisma generate client

RUN  npm run build

CMD [ "npm","start" ]
