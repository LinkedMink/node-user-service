FROM node:16-alpine

ARG ENVIRONMENT=development

ENV NODE_ENV ENVIRONMENT
ENV IS_CONTAINER_ENV true

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN apk update
RUN apk add curl python3 --no-cache --virtual build-dependencies build-base gcc

RUN yarn install --production=true

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "start:built" ]
