FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY conf.d/default.conf /etc/nginx/conf.d/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

