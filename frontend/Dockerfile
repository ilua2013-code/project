FROM alt:p11

RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r nginx && useradd -r -g nginx nginx

COPY ./dist/task-manager /var/www/html

COPY nginx.conf /etc/nginx/nginx.conf

RUN chown -R nginx:nginx /var/www/html && \
    chmod -R 755 /var/www/html && \
    mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]