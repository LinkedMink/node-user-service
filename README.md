# Node User Service
This service authenticates users against records in a MongoDB. When authenticated, users
are issued a JWT token with a set of claims describing operations a user can perform. 
Endpoints also exist for CRUD operations on users.

## Microservice Collection
This project is part of a collection of microservices for supporting a larger project.

These services include:
* [Node User Service](https://github.com/LinkedMink/node-user-service)
* [Node Base Service](https://github.com/LinkedMink/node-base-service)

## Getting Started
### Install Prerequisites 
#### Required
The application was tested with these major versions:
* MongoDB 3.6
* Node.js 12

#### Recommended
* Docker
* Kubernetes Provider

This package doesn't target any specific platform or provider. Sample files for Kubernetes 
deployment will be included for Azure AKS.

Install the npm packages.

```sh
cd node-user-service
npm install -g cross-env
npm install
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

Seed the database with the initial user and claims.

```sh
npm run seedClaims
npm run addUser myuser@email.com StrongPass*1 UserManage ClaimManage
```

### Config
You will need to generate a private/public key pair. This is used to sign the JWT tokens. 
The node-user-service uses the private key to sign while the consuming services will use the 
public key to validate.

```sh
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

Create a .env file in the root of the project directory. A few environmental variables 
are required for the application to run.

```sh
MONGO_DB_CONNECTION_STRING=mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database.collection][?options]]
# The path to a file containing the JWT private key. 
JWT_SECRET_KEY_FILE=jwtRS256.key
# A sensible name to give as the issuing authority and intended audience
# https://tools.ietf.org/html/rfc7519#section-4.1
JWT_AUDIENCE=client.[Your Domain]
JWT_ISSUER=api.[Your Domain]
```

The application should now be runnable locally.

```sh
npm start
```

### Deployment
Docker isn't required to run this service, but in a microservice architecture, use of containers 
has become ubiquitous. Create the Docker image and push it up to a Docker registry.

```sh
cd ./node-user-service
npm run containerize
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

The project contains a sample deployment.yaml file for deploying to a Kubernetes cluster. Edit the 
file as necessary. Then apply the changes to your cluster.

```sh
kubectl apply -f ./deployment.yaml
```
