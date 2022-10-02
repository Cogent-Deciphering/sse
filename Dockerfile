FROM nginx:alpine

WORKDIR /app

COPY ./client .

COPY ./nginx.conf /etc/nginx/nginx.conf
