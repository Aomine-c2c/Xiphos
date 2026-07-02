FROM python:3.10-slim

# Install system dependencies if required for psycopg2/cffi/numpy
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Ensure storage directory exists
RUN mkdir -p storage

# Default command (overridden by compose for worker/api)
CMD ["python", "api_server.py"]
