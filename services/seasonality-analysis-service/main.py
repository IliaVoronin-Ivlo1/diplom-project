import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis
import psycopg2
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import cmdstanpy
    cmdstan_path = cmdstanpy.utils.cmdstan_path()
    os.environ['CMDSTAN'] = str(cmdstan_path)
    cmdstanpy.set_cmdstan_path(cmdstan_path)
except:
    pass

from services.seasonality_logic import SeasonalityService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

redis_client = None
db_connection = None
seasonality_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, db_connection, seasonality_service
    
    try:
        redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'redis'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            password=os.getenv('REDIS_PASSWORD'),
            decode_responses=True
        )
        redis_client.ping()
        logger.info('Подключение к Redis установлено')
    except Exception as e:
        logger.error(f'Ошибка подключения к Redis {str(e)}')
    
    try:
        db_connection = psycopg2.connect(
            host=os.getenv('DB_HOST', 'postgres'),
            port=int(os.getenv('DB_PORT', 5432)),
            database=os.getenv('DB_NAME', 'Corstat'),
            user=os.getenv('DB_USER', 'Corstat'),
            password=os.getenv('DB_PASSWORD', 'Rhtyltkm1#')
        )
        logger.info('Подключение к PostgreSQL установлено')
    except Exception as e:
        logger.error(f'Ошибка подключения к PostgreSQL {str(e)}')
    
    seasonality_service = SeasonalityService(redis_client, db_connection)
    
    yield
    
    if redis_client:
        redis_client.close()
    if db_connection:
        db_connection.close()

app = FastAPI(
    title="Seasonality Analysis Service",
    description="Сервис анализа сезонности цен автозапчастей",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "service": "seasonality-analysis-service",
        "description": "Сервис анализа сезонности цен автозапчастей",
        "status": "running"
    }

@app.get("/health")
async def health():
    redis_status = "connected" if redis_client else "disconnected"
    db_status = "connected" if db_connection else "disconnected"
    return {
        "status": "healthy",
        "redis": redis_status,
        "database": db_status
    }

@app.get("/analyze")
async def analyze_seasonality(history_id: int = None):
    if not seasonality_service:
        return {"error": "Seasonality service not initialized"}
    result = seasonality_service.analyze_seasonality(history_id)
    return result

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('SERVICE_PORT', 8008))
    logger.info(f'Запуск сервиса анализа сезонности на порту {port}')
    uvicorn.run(app, host="0.0.0.0", port=port)

