import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import cmdstanpy
    cmdstan_path = cmdstanpy.utils.cmdstan_path()
    os.environ['CMDSTAN'] = str(cmdstan_path)
    cmdstanpy.set_cmdstan_path(cmdstan_path)
except:
    pass

from services.price_forecasting_logic import PriceForecastingService
from services.database import init_db_pool, close_db_pool
from services.connections import init_redis_connection, close_redis_connection, get_redis_client

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

forecasting_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global forecasting_service
    
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
        forecasting_service = PriceForecastingService(redis_client)
        logger.info("Main[lifespan] PriceForecastingService initialized")
    except Exception as e:
        logger.error(f"Main[lifespan] Failed to initialize PriceForecastingService: {str(e)}")
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
    title="Price Forecasting Service",
    description="Сервис прогнозирования цен автозапчастей",
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
        "service": "price-forecasting-service",
        "description": "Сервис прогнозирования цен автозапчастей",
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

@app.get("/forecast")
async def forecast_prices(history_id: int = None, forecast_days: int = 30):
    if not forecasting_service:
        return {"error": "Forecasting service not initialized"}
    result = forecasting_service.forecast_prices(history_id, forecast_days)
    return result

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('SERVICE_PORT', 8009))
    logger.info(f"Main[__main__] Starting price forecasting service on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

