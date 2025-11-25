import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis
import psycopg2
from contextlib import asynccontextmanager

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

redis_client = None
db_connection = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, db_connection
    
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
    
    yield
    
    if redis_client:
        redis_client.close()
    if db_connection:
        db_connection.close()

app = FastAPI(
    title="Supplier Rating Service",
    description="Анализ и рейтинг поставщиков",
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
        "service": "supplier-rating-service",
        "description": "Анализ и рейтинг поставщиков",
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

@app.post("/analyze")
async def analyze_supplier(data: dict):
    return {
        "service": "supplier-rating-service",
        "message": "Анализ поставщика выполнен",
        "data": data
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('SERVICE_PORT', 8001))
    logger.info(f'Запуск сервиса анализа поставщиков на порту {port}')
    uvicorn.run(app, host="0.0.0.0", port=port)

