FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    postgresql-client \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt && \
    python -c "import cmdstanpy; cmdstanpy.install_cmdstan(overwrite=True)" && \
    bash -c "mkdir -p /usr/local/lib/python3.11/site-packages/prophet/stan_model/cmdstan-2.33.1 && cp /root/.cmdstan/cmdstan-*/makefile /usr/local/lib/python3.11/site-packages/prophet/stan_model/cmdstan-2.33.1/ && ls -la /usr/local/lib/python3.11/site-packages/prophet/stan_model/cmdstan-2.33.1/"

COPY . .

EXPOSE 8008

CMD ["python", "main.py"]

