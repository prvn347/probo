FROM node:20-alpine

WORKDIR /worker-engine

COPY package*json ./
RUN  npm install

COPY . .
RUN  npm run build
CMD [ "npm","start" ]