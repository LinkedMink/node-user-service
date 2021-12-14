# Node User Service

![Build State](https://github.com/LinkedMink/node-user-service/actions/workflows/build-main.yml/badge.svg)

This service authenticates users against records in a MongoDB. When authenticated, users
are issued a JWT token with a set of claims describing operations a user can perform.
It's designed to be used in a microservice architecture where claims are defined by associated
services other than a core claims for managing users and claims.

## Microservice Collection

This project is part of a collection of microservices for supporting a larger project.

## Getting Started

### Install Prerequisites

#### Required

The application was tested with these major versions:

- MongoDB 4.2
- Node.js 14 & 16

#### Recommended

- Docker
- Kubernetes Provider

This package doesn't target any specific platform or provider. Sample files for Kubernetes
deployment are included.

Install the npm packages using yarn.

```sh
# Ensure yarn is installed globally
npm install -g yarn
cd node-user-service
yarn install
```

### Database

Create the user service database and a user that can access it.

```javascript
use userServiceDB
db.createUser(
  {
    user: "userService",
    pwd: "[STRONG PASSWORD]",
    roles: [
      { role: "readWrite", db: "userServiceDB" }
    ]
  }
)
```

#### Initial Data

To add users and authorization claims, populate a yaml file with seed claims and users. See
[SampleClaims.yaml](/SampleClaims.yaml) and [SampleUsers.yaml](/SampleUsers.yaml) for an example
of the data format. Seed the database with the initial user and claims.

```sh
yarn run addClaims -- MyClaims.yaml
yarn run addUsers -- MyUsers.yaml
```

### Config

You will need to generate a private/public key pair. This is used to sign the JWT tokens.
The node-user-service uses the private key to sign while the consuming services will use the
public key to validate.

```sh
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

A few environmental variables are required for the application to run. Create a .env file in
the root of the project directory and refer to [template.env](/template.env) for allowed values.

```sh
cp template.env .env
# Edit .env
```

The application should now be runnable locally.

```sh
yarn start
```

### Deployment

#### Docker

Docker isn't required to run this service, but in a microservice architecture, use of containers
has become ubiquitous. Create the Docker image and push it up to a Docker registry.

```sh
docker build -t linkedmink/node-user-service
docker push linkedmink/node-user-service
```

You can run the images directly for testing or simplicity.

```sh
docker run -d \
  -p 80:8080 \
  -e ALLOWED_ORIGINS=https://mydomain.com \
  -e MONGO_DB_CONNECTION_STRING=... \
  -e JWT_SECRET_KEY_FILE=... \
  -e JWT_AUDIENCE=... \
  -e JWT_ISSUER=... \
  --name node-user-service \
  linkedmink/node-user-service
```

#### Kubernetes

The project contains a sample deployment.yaml file for deploying to a Kubernetes cluster. Edit the
file as necessary. Then apply the changes to your cluster.

```sh
kubectl create secret generic jwt-private-key \
  --namespace necro-automobilia \
  --from-file=../../keys/jwtRS256.key

kubectl apply -f ./deployment.yaml
```

Additionally, there's a basic build script that constructs a multi-platform docker image and rolls
out the latest version to a Kubernetes cluster.

```sh
# Edit build.sh or supply environment variables to override
KUBERNETES_NAMESPACE=my-app build.sh deploy
```
