import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis
import psycopg2
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from services.clustering_logic import ClusteringService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

redis_client = None
db_connection = None
clustering_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, db_connection, clustering_service
    
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
    
    clustering_service = ClusteringService(redis_client, db_connection)
    
    yield
    
    if redis_client:
        redis_client.close()
    if db_connection:
        db_connection.close()

app = FastAPI(
    title="Clustering Service",
    description="Сервис кластеризации поставщиков",
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
        "service": "clustering-service",
        "description": "Сервис кластеризации поставщиков",
        "status": "running"
    }

@app.get("/cluster")
async def cluster_suppliers(history_id: int = None):
    if not clustering_service:
        return {"error": "Clustering service not initialized"}
    result = clustering_service.cluster_suppliers(history_id)
    return result

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('SERVICE_PORT', 8005))
    logger.info(f'Запуск сервиса кластеризации на порту {port}')
    uvicorn.run(app, host="0.0.0.0", port=port)

