# backend/app/services/vector_search.py
import os
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")

# If you have a password set, you can also pass that
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0) # hosted by docker daemon 

def add_vector(key: str, vector: list[float]):
    # Example using HSET (although actual Vector usage is with Redis Search module)
    redis_client.hset(key, mapping={"embedding": str(vector)})

def search_similar(query_vector: list[float], top_k: int = 5):
    # This is a conceptual skeleton. In practice, you need RediSearch with a vector field.
    # For example, if using the new Vector similarity in Redis 7:
    # FT.SEARCH <index_name> "*=>[KNN $top_k @embedding $vector AS vector_score]" ...
    pass
