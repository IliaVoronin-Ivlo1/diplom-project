import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis
import psycopg2
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from services.genetic_algorithm_logic import GeneticAlgorithmService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

redis_client = None
db_connection = None
genetic_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, db_connection, genetic_service
    
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
    
    supplier_rating_url = os.getenv('SUPPLIER_RATING_SERVICE_URL', 'http://diplom_supplier_rating_service:8001')
    genetic_service = GeneticAlgorithmService(redis_client, db_connection, supplier_rating_url)
    
    yield
    
    if redis_client:
        redis_client.close()
    if db_connection:
        db_connection.close()

app = FastAPI(
    title="Genetic Algorithm Service",
    description="Сервис выбора лучшего поставщика с использованием генетического алгоритма",
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
        "service": "genetic-algorithm-service",
        "description": "Сервис выбора лучшего поставщика с использованием генетического алгоритма",
        "status": "running"
    }

@app.get("/find-best-supplier")
async def find_best_supplier(fitness_threshold: float = 0.5, history_id: int = None):
    if not genetic_service:
        return {"error": "Genetic algorithm service not initialized"}
    result = genetic_service.find_best_supplier(fitness_threshold=fitness_threshold, history_id=history_id)
    return result

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('SERVICE_PORT', 8006))
    logger.info(f'Запуск сервиса генетического алгоритма на порту {port}')
    uvicorn.run(app, host="0.0.0.0", port=port)

