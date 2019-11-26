# Node User Service

## Microservices
This project is part of a collection of microservices for supporting a larger project.

These services include:
* [Node User Service](https://github.com/LinkedMink/node-user-service)


## Database

```
use userServiceDB
db.createUser(
    {
        user: "userService",
        pwd: "hKsnyX284nYN4gp7RCDa",
        roles: [
            { role: "readWrite", db: "userServiceDB" }
        ]
    }
)
```