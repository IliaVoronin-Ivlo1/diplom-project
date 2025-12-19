import os
import logging
import psycopg2
from psycopg2 import pool
from contextlib import contextmanager
from typing import Optional

logger = logging.getLogger(__name__)

_db_pool: Optional[pool.ThreadedConnectionPool] = None

def init_db_pool():
    global _db_pool
    
    if _db_pool is not None:
        return _db_pool
    
    db_host = os.getenv('DB_HOST')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME')
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    
    if not all([db_host, db_name, db_user, db_password]):
        raise ValueError("Database connection parameters are not set")
    
    min_conn = int(os.getenv('DB_POOL_MIN', '2'))
    max_conn = int(os.getenv('DB_POOL_MAX', '10'))
    
    try:
        _db_pool = pool.ThreadedConnectionPool(
            min_conn,
            max_conn,
            host=db_host,
            port=int(db_port),
            database=db_name,
            user=db_user,
            password=db_password
        )
        logger.info(f"DatabaseConnectionPool[init_db_pool] Pool initialized with {min_conn}-{max_conn} connections")
        return _db_pool
    except Exception as e:
        logger.error(f"DatabaseConnectionPool[init_db_pool] Failed to create connection pool: {str(e)}")
        raise

def close_db_pool():
    global _db_pool
    
    if _db_pool is not None:
        _db_pool.closeall()
        _db_pool = None
        logger.info("DatabaseConnectionPool[close_db_pool] Pool closed")

@contextmanager
def get_db_connection():
    if _db_pool is None:
        raise RuntimeError("Database pool not initialized")
    
    conn = None
    try:
        conn = _db_pool.getconn()
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"DatabaseConnectionPool[get_db_connection] Error: {str(e)}")
        raise
    finally:
        if conn:
            _db_pool.putconn(conn)

@contextmanager
def get_db_cursor():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            yield cursor
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"DatabaseConnectionPool[get_db_cursor] Error: {str(e)}")
            raise
        finally:
            cursor.close()

def check_db_connection():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
        return True
    except:
        return False

