FROM node:20-alpine AS build

ARG ENVIRONMENT=production

RUN --mount=type=cache,target=/var/cache/apk/ \
    apk add python3 make g++

USER node
WORKDIR /home/node/build

COPY --chown=node:node package.json package-lock.json ./
RUN --mount=type=cache,target=/home/node/.npm/,uid=1000,gid=1000 \
    npm ci --loglevel info \
    $([[ "$ENVIRONMENT" == "production" ]] && echo -n '--omit optional')

COPY --chown=node:node ./ ./

RUN if [[ "$ENVIRONMENT" == "production" ]] ; then \
      npm run build:prod ; else \
      npm run build ; fi

RUN npm prune --omit dev \
    $([[ "$ENVIRONMENT" == "production" ]] && echo -n '--omit optional')

FROM node:20-alpine AS runtime

ARG ENVIRONMENT=production
ENV NODE_ENV=$ENVIRONMENT IS_CONTAINER_ENV=true

USER node
WORKDIR /home/node/app

COPY --from=build /home/node/build/dist/ /home/node/build/package.json ./
COPY --from=build /home/node/build/docs/OpenApi.json ./docs/OpenApi.json
COPY --from=build /home/node/build/emails/ ./emails/
COPY --from=build /home/node/build/node_modules/ ./node_modules/

EXPOSE 8080/tcp

CMD [ "node", "--enable-source-maps", "bin/index.mjs" ]
