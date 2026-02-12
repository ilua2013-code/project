FROM alt:p11

RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-devel \
    glibc \ 
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

RUN LIBRT_PATH=$(find /usr -name "librt.so.1" 2>/dev/null | head -1) && \
    if [ -n "$LIBRT_PATH" ]; then \
        ln -sf "$LIBRT_PATH" /usr/lib/librt.so; \
        echo "Создана ссылка на $LIBRT_PATH"; \
    else \
        echo "ОШИБКА: librt.so.1 не найден!"; \
        find /usr -name "*rt*.so*" 2>/dev/null; \
        exit 1; \
    fi

RUN python3 -m ensurepip --upgrade

RUN ln -s /usr/bin/python3 /usr/bin/python && \
    ln -s /usr/bin/pip3 /usr/bin/pip

WORKDIR /app


COPY requirements.txt .
RUN python3 -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt


COPY backend/ ./backend/
COPY tests_backend/ ./tests_backend/
COPY pytest.ini ./


ENV PYTHONPATH=/app:$PYTHONPATH

WORKDIR /app/backend