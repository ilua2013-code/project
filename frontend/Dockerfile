FROM alt:p11

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    curl \
    xz \
    glibc \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Установка Node.js
RUN curl -fsSL https://nodejs.org/dist/v18.20.4/node-v18.20.4-linux-x64.tar.xz \
    | tar -xJ -C /usr/local --strip-components=1

# Устанавливаем PATH для Node.js
ENV PATH="/usr/local/bin:$PATH"

# Проверяем установку Node.js
RUN node --version && npm --version

WORKDIR /app

# Копирование зависимостей
COPY package*.json ./

# Установка зависимостей Angular
RUN npm ci --legacy-peer-deps --omit=optional

# Установка esbuild (после основных зависимостей)
RUN npm install esbuild --save-dev

# Копирование исходного кода
COPY . .

EXPOSE 4200
