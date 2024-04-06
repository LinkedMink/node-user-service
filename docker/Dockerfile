FROM node:20-alpine

ARG ENVIRONMENT=production

ENV NODE_ENV $ENVIRONMENT
ENV IS_CONTAINER_ENV true

USER node

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY . .

RUN npm ci --omit dev \
    $([[ "$ENVIRONMENT" == "production" ]] && echo -n '--omit optional')

EXPOSE 8080/tcp

CMD [ "node", "--enable-source-maps", "dist/bin/Server.mjs" ]
