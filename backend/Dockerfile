FROM alt:p11

RUN apt-get update && \
    apt-get install -y python3 python3-devel sqlite3 glibc && \
    python3 -m ensurepip --upgrade && \
    ln -s /usr/bin/pip3 /usr/bin/pip

ENV PYTHONPATH=/app:$PYTHONPATH

WORKDIR /app

COPY requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt


COPY backend/ ./backend/


RUN touch /app/backend/__init__.py

WORKDIR /app/backend

RUN echo "import sys" > /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "try:" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "    import pysqlite3" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "    sys.modules['sqlite3'] = pysqlite3" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "    sys.modules['sqlite3.dbapi2'] = pysqlite3" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "    print('[sitecustomize] pysqlite3 загружен как sqlite3')" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "except ImportError as e:" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "    print(f'[sitecustomize] Ошибка: {e}')" >> /usr/lib/python3/site-packages/sitecustomize.py

CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]