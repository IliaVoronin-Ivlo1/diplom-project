import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis
import psycopg2
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from services.reverse_genetic_algorithm_logic import ReverseGeneticAlgorithmService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

redis_client = None
db_connection = None
reverse_genetic_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, db_connection, reverse_genetic_service
    
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
    
    reverse_genetic_service = ReverseGeneticAlgorithmService(redis_client, db_connection)
    
    yield
    
    if redis_client:
        redis_client.close()
    if db_connection:
        db_connection.close()

app = FastAPI(
    title="Reverse Genetic Algorithm Service",
    description="Сервис выбора лучших автозапчастей с последующим рейтингом поставщиков",
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
        "service": "reverse-genetic-algorithm-service",
        "description": "Сервис выбора лучших автозапчастей с последующим рейтингом поставщиков",
        "status": "running"
    }

@app.get("/find-best-article-brands")
async def find_best_article_brands(history_id: int = None):
    if not reverse_genetic_service:
        return {"error": "Reverse genetic algorithm service not initialized"}
    result = reverse_genetic_service.find_best_article_brands(history_id)
    return result

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('SERVICE_PORT', 8007))
    logger.info(f'Запуск сервиса обратного генетического алгоритма на порту {port}')
    uvicorn.run(app, host="0.0.0.0", port=port)

