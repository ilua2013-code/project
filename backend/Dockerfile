FROM alt:p11

RUN apt-get update && \
    apt-get install -y python3 python3-devel sqlite3 glibc && \
    python3 -m ensurepip --upgrade

WORKDIR /app

COPY requirements.txt .
RUN python3 -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

COPY backend/ ./backend/

WORKDIR /app/backend