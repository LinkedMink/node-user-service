#/bin/sh

if [ -z "$DOCKER_REGISTRY" ]; then
  DOCKER_REGISTRY="" 
fi

npm run containerize

sleep 1

docker tag \
  linkedmink/node-user-service \
  "${DOCKER_REGISTRY}linkedmink/node-user-service"

sleep 1

docker push "${DOCKER_REGISTRY}linkedmink/node-user-service"

sleep 1

kubectl set image \
  deployment/node-user-service \
  node-user-service="${DOCKER_REGISTRY}linkedmink/node-user-service:latest" \
  --record

sleep 1

kubectl rollout status deployment/node-user-service
