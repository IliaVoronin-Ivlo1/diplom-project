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
    bash -c "CMDSTAN_DIR=\$(ls -d /root/.cmdstan/cmdstan-* 2>/dev/null | head -1); if [ -n \"\$CMDSTAN_DIR\" ] && [ -f \"\$CMDSTAN_DIR/makefile\" ]; then mkdir -p /usr/local/lib/python3.11/site-packages/prophet/stan_model/cmdstan-2.33.1 && cp \"\$CMDSTAN_DIR/makefile\" /usr/local/lib/python3.11/site-packages/prophet/stan_model/cmdstan-2.33.1/ && echo 'Makefile copied successfully'; else echo 'Warning: CmdStan makefile not found'; fi"

COPY . .

EXPOSE 8009

CMD ["python", "main.py"]

