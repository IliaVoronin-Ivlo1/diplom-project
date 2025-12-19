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
    bash -c "CMDSTAN_DIR=\$(find /root/.cmdstan -maxdepth 1 -type d -name 'cmdstan-*' | head -1) && \
             PROPHET_CMDSTAN=/usr/local/lib/python3.11/site-packages/prophet/stan_model/cmdstan-2.33.1 && \
             mkdir -p \${PROPHET_CMDSTAN} && \
             cp \${CMDSTAN_DIR}/makefile \${PROPHET_CMDSTAN}/ && \
             cp -r \${CMDSTAN_DIR}/bin \${PROPHET_CMDSTAN}/ && \
             cp -r \${CMDSTAN_DIR}/stan \${PROPHET_CMDSTAN}/ && \
             echo 'Copied CmdStan files from \${CMDSTAN_DIR} to \${PROPHET_CMDSTAN}'"

COPY . .

EXPOSE 8009

CMD ["python", "main.py"]

