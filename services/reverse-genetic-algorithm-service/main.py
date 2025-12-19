import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from services.reverse_genetic_algorithm_logic import ReverseGeneticAlgorithmService
from services.database import init_db_pool, close_db_pool
from services.connections import init_redis_connection, close_redis_connection, get_redis_client

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

reverse_genetic_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global reverse_genetic_service
    
    try:
        init_redis_connection()
        logger.info("Main[lifespan] Redis connection initialized")
    except Exception as e:
        logger.error(f"Main[lifespan] Failed to initialize Redis: {str(e)}")
        raise
    
    try:
        init_db_pool()
        logger.info("Main[lifespan] Database pool initialized")
    except Exception as e:
        logger.error(f"Main[lifespan] Failed to initialize database pool: {str(e)}")
        raise
    
    try:
        redis_client = get_redis_client()
        reverse_genetic_service = ReverseGeneticAlgorithmService(redis_client)
        logger.info("Main[lifespan] ReverseGeneticAlgorithmService initialized")
    except Exception as e:
        logger.error(f"Main[lifespan] Failed to initialize ReverseGeneticAlgorithmService: {str(e)}")
        raise
    
    yield
    
    try:
        close_redis_connection()
        logger.info("Main[lifespan] Redis connection closed")
    except Exception as e:
        logger.error(f"Main[lifespan] Error closing Redis: {str(e)}")
    
    try:
        close_db_pool()
        logger.info("Main[lifespan] Database pool closed")
    except Exception as e:
        logger.error(f"Main[lifespan] Error closing database pool: {str(e)}")

app = FastAPI(
    title="Reverse Genetic Algorithm Service",
    description="Сервис выбора лучших автозапчастей с последующим рейтингом поставщиков",
    lifespan=lifespan
)

allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:8080,http://localhost:3001').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "service": "reverse-genetic-algorithm-service",
        "description": "Сервис выбора лучших автозапчастей с последующим рейтингом поставщиков",
        "status": "running"
    }

@app.get("/health")
async def health():
    from services.connections import get_redis_client
    from services.database import check_db_connection
    
    redis_status = "disconnected"
    db_status = "disconnected"
    
    try:
        redis_client = get_redis_client()
        redis_client.ping()
        redis_status = "connected"
    except:
        pass
    
    if check_db_connection():
        db_status = "connected"
    
    status = "healthy" if redis_status == "connected" and db_status == "connected" else "unhealthy"
    
    return {
        "status": status,
        "redis": redis_status,
        "database": db_status
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
    logger.info(f"Main[__main__] Starting reverse genetic algorithm service on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

