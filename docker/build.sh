#!/usr/bin/env bash
# Usage: build.sh [true]

set -e

IMAGE_NAME="node-user-service"
VERSION=$(npm pkg get version | sed 's/"//g')

if [ "$1" == true ]; then
  DOCKER_BUILD_OPTIONS="--push"
  ARCHITECTURES="linux/amd64,linux/arm64" 
else
  DOCKER_BUILD_OPTIONS="--load"
  ARCHITECTURES="linux/amd64"
fi

if [ -z "$DOCKER_REGISTRY" ]; then
  DOCKER_REGISTRY="" 
elif [[ "$DOCKER_REGISTRY" != "*/" ]]; then
  DOCKER_REGISTRY="${DOCKER_REGISTRY}/"
fi

if [ -z "$DOCKER_SCOPE" ]; then
  DOCKER_SCOPE="linkedmink/" 
elif [[ "$DOCKER_SCOPE" != "*/" ]]; then
  DOCKER_SCOPE="${DOCKER_SCOPE}/"
fi

startTime=$(date +"%s")
echo "---------- Build Started: $startTime ----------"

npm run build:prod

PACKAGE_ARCHIVE=$(npm pack | tail -1)
tar --extract --verbose --file="$PACKAGE_ARCHIVE" --directory="docker"
cp ./package-lock.json ./docker/package

docker buildx build ./docker/package \
  --build-arg ENVIRONMENT=production \
  --file "docker/Dockerfile.nodejs" \
  --platform "${ARCHITECTURES}" \
  --tag "${DOCKER_REGISTRY}${DOCKER_SCOPE}${IMAGE_NAME}:latest" \
  --tag "${DOCKER_REGISTRY}${DOCKER_SCOPE}${IMAGE_NAME}:${VERSION}" \
  --progress "plain" \
  ${DOCKER_BUILD_OPTIONS}

  # --tag "${DOCKER_REGISTRY}${DOCKER_SCOPE}${IMAGE_NAME}:nodejs" \
  # --tag "${DOCKER_REGISTRY}${DOCKER_SCOPE}${IMAGE_NAME}:${VERSION}-nodejs" \
# docker buildx build ./docker/package \
#   --build-arg ENVIRONMENT=production \
#   --file "docker/Dockerfile.bun" \
#   --platform "${ARCHITECTURES}" \
#   --tag "${DOCKER_REGISTRY}${DOCKER_SCOPE}${IMAGE_NAME}:bun" \
#   --tag "${DOCKER_REGISTRY}${DOCKER_SCOPE}${IMAGE_NAME}:${VERSION}" \
#   --tag "${DOCKER_REGISTRY}${DOCKER_SCOPE}${IMAGE_NAME}:${VERSION}-bun" \
#   --progress "plain" \
#   --push

endTime=$(date +"%s")
elapsed="$((endTime - startTime))"
echo "---------- Build Finished: ${elapsed} seconds ----------"
