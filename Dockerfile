FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8080 HOME=/tmp
WORKDIR /app
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt
COPY frontend/ /app/frontend/
COPY backend/ /app/backend/
RUN useradd -r -u 10001 -m zori && chown -R zori /app
USER zori
EXPOSE 8080
CMD ["sh", "-c", "exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT} --workers 1 --timeout-keep-alive 60"]
