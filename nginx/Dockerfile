FROM nginx:alpine

# envsubst có sẵn trong nginx:alpine
# Entrypoint: thay ${DOMAIN} trong template rồi mới start nginx
COPY nginx.conf /etc/nginx/nginx.conf.template

# Script startup: envsubst → validate → run
CMD ["/bin/sh", "-c", \
    "envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && \
     nginx -t && \
     exec nginx -g 'daemon off;'"]
