import os
from typing import Optional

class Settings:
    SERVICE_NAME: str = os.getenv('SERVICE_NAME', 'supplier-rating-service')
    SERVICE_PORT: int = int(os.getenv('SERVICE_PORT', 8001))
    
    REDIS_HOST: str = os.getenv('REDIS_HOST', 'redis')
    REDIS_PORT: int = int(os.getenv('REDIS_PORT', 6379))
    REDIS_PASSWORD: Optional[str] = os.getenv('REDIS_PASSWORD')
    
    DB_HOST: str = os.getenv('DB_HOST', 'postgres')
    DB_PORT: int = int(os.getenv('DB_PORT', 5432))
    DB_NAME: str = os.getenv('DB_NAME', 'Corstat')
    DB_USER: str = os.getenv('DB_USER', 'Corstat')
    DB_PASSWORD: str = os.getenv('DB_PASSWORD', 'Rhtyltkm1#')
    
    @property
    def database_url(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()

