FROM node:20-alpine

WORKDIR /worker-engine

COPY ./worker-engine/package*json ./
RUN  npm install

COPY ./worker-engine .
RUN  npm run build
CMD [ "npm","start" ]