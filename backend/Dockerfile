FROM alt:p11

# 1. Установка Python
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-devel \
    glibc \ 
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# 2. Поиск и создание ссылки на librt.so.1
RUN LIBRT_PATH=$(find /usr -name "librt.so.1" 2>/dev/null | head -1) && \
    if [ -n "$LIBRT_PATH" ]; then \
        ln -sf "$LIBRT_PATH" /usr/lib/librt.so; \
        echo "Создана ссылка на $LIBRT_PATH"; \
    else \
        echo "ОШИБКА: librt.so.1 не найден!"; \
        find /usr -name "*rt*.so*" 2>/dev/null; \
        exit 1; \
    fi

# 3. Установка pip
RUN python3 -m ensurepip --upgrade

# 4. Создание симлинков
RUN ln -s /usr/bin/python3 /usr/bin/python && \
    ln -s /usr/bin/pip3 /usr/bin/pip

# 5. Рабочая директория
WORKDIR /app

# 6. Установка зависимостей
COPY requirements.txt .
RUN python3 -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

# 7. Копирование кода
COPY backend/ ./backend/
COPY tests_backend/ ./tests_backend/
COPY pytest.ini ./

# 8. Настройка окружения
ENV PYTHONPATH=/app:$PYTHONPATH

# 9. Директория для запуска
WORKDIR /app/backend