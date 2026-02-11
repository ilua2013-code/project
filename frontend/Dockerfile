FROM alt:p11


RUN apt-get update && apt-get install -y node npm && rm -rf /var/lib/apt/lists/*


RUN groupadd -r appuser && useradd -r -g appuser -m -d /home/appuser appuser


RUN mkdir -p /app && chown -R appuser:appuser /app


ENV NPM_CONFIG_CACHE=/tmp/.npm
RUN mkdir -p /tmp/.npm && chown -R appuser:appuser /tmp/.npm

WORKDIR /app


COPY --chown=appuser:appuser package*.json ./
RUN npm ci --legacy-peer-deps


RUN npm install -g @angular/cli


USER appuser


COPY --chown=appuser:appuser . .

EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check"]