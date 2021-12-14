FROM node:16-alpine

ARG ENVIRONMENT=development

ENV NODE_ENV ENVIRONMENT
ENV IS_CONTAINER_ENV true
ENV YARN_ENABLE_INLINE_BUILDS=true

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./
COPY .yarn ./

RUN apk update
RUN apk add curl python3 --no-cache --virtual build-dependencies build-base gcc

RUN yarn install --production=true --immutable --inline-builds
# RUN yarn workspaces focus --all --production

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "start:built" ]
