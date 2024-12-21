FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    postgresql-client \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


WORKDIR /app
COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt
RUN pip install uvicorn
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]