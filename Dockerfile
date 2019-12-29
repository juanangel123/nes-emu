# specify the node base image with your desired version node:<version>
FROM node:12-alpine

RUN apk --no-cache update && \
    apk --no-cache upgrade && \
    apk --no-cache add bash

# replace this with your application's default port
EXPOSE 8081