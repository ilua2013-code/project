FROM alt:p11

RUN apt-get update && \
    apt-get install -y python3 python3-devel sqlite3 glibc && \
    python3 -m ensurepip --upgrade && \
    ln -s /usr/bin/pip3 /usr/bin/pip

ENV PYTHONPATH=/app:$PYTHONPATH

WORKDIR /app

COPY requirements.txt .

RUN python3 -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt


COPY backend/ ./backend/


RUN touch /app/backend/__init__.py

WORKDIR /app/backend

CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]