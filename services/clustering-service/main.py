import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from services.clustering_logic import ClusteringService
from services.database import init_db_pool, close_db_pool
from services.connections import init_redis_connection, close_redis_connection, get_redis_client

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

clustering_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global clustering_service
    
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
        clustering_service = ClusteringService(redis_client)
        logger.info("Main[lifespan] ClusteringService initialized")
    except Exception as e:
        logger.error(f"Main[lifespan] Failed to initialize ClusteringService: {str(e)}")
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
    title="Clustering Service",
    description="Сервис кластеризации поставщиков",
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
        "service": "clustering-service",
        "description": "Сервис кластеризации поставщиков",
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

@app.get("/cluster")
async def cluster_suppliers(history_id: int = None):
    if not clustering_service:
        return {"error": "Clustering service not initialized"}
    result = clustering_service.cluster_suppliers(history_id)
    return result

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('SERVICE_PORT', 8005))
    logger.info(f"Main[__main__] Starting clustering service on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

