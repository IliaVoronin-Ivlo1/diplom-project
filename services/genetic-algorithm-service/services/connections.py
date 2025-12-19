import os
import logging
import redis
from typing import Optional

logger = logging.getLogger(__name__)

_redis_client: Optional[redis.Redis] = None

def init_redis_connection() -> redis.Redis:
    global _redis_client
    
    if _redis_client is not None:
        return _redis_client
    
    redis_host = os.getenv('REDIS_HOST')
    redis_port = os.getenv('REDIS_PORT', '6379')
    redis_password = os.getenv('REDIS_PASSWORD')
    
    if not redis_host:
        raise ValueError("Redis host is not set")
    
    try:
        _redis_client = redis.Redis(
            host=redis_host,
            port=int(redis_port),
            password=redis_password,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
        _redis_client.ping()
        logger.info(f"RedisConnection[init_redis_connection] Connection established to {redis_host}:{redis_port}")
        return _redis_client
    except Exception as e:
        logger.error(f"RedisConnection[init_redis_connection] Failed to connect: {str(e)}")
        raise

def close_redis_connection():
    global _redis_client
    
    if _redis_client is not None:
        _redis_client.close()
        _redis_client = None
        logger.info("RedisConnection[close_redis_connection] Connection closed")

def get_redis_client() -> redis.Redis:
    if _redis_client is None:
        raise RuntimeError("Redis connection not initialized")
    return _redis_client

