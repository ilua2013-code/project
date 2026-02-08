FROM alt:p11

RUN apt-get update && \
    apt-get install -y python3 python3-devel sqlite3 glibc && \
    python3 -m ensurepip --upgrade && \
    ln -s /usr/bin/pip3 /usr/bin/pip

WORKDIR /app

COPY . .

RUN python3 -m pip install --no-cache-dir -r requirements.txt

RUN echo "import sys" > /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "try:" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "    import pysqlite3" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "    sys.modules['sqlite3'] = pysqlite3" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "    sys.modules['sqlite3.dbapi2'] = pysqlite3" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "    print('[sitecustomize] pysqlite3 загружен как sqlite3')" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "except ImportError as e:" >> /usr/lib/python3/site-packages/sitecustomize.py && \
    echo "    print(f'[sitecustomize] Ошибка: {e}')" >> /usr/lib/python3/site-packages/sitecustomize.py
ENV PYTHONPATH=/app:$PYTHONPATH

