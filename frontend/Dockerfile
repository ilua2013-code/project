FROM alt:p11

RUN apt-get update && apt-get install -y node npm && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser && useradd -r -g appuser -m -d /home/appuser appuser && \
    mkdir -p /app && chown -R appuser:appuser /app

WORKDIR /app


COPY --chown=appuser:appuser node_modules ./node_modules/
COPY --chown=appuser:appuser package*.json ./


RUN npm install -g @angular/cli

USER appuser
COPY --chown=appuser:appuser . .

EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check"]