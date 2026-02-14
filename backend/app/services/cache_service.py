import os
from diskcache import Cache
from functools import wraps
import json
import hashlib

# Initialize a persistent cache in the project's temporary directory or local app folder
cache_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".cache")
cache = Cache(cache_dir)

def api_cache(expire=86400): # Default 24 hours
    """
    Decorator to cache the results of a function based on its arguments.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create a unique key based on function name and arguments
            # We skip the first arg (self) for class methods
            key_parts = [func.__name__] + list(args[1:]) + [f"{k}:{v}" for k, v in sorted(kwargs.items())]
            key_str = ":".join(map(str, key_parts))
            key = hashlib.md5(key_str.encode()).hexdigest()

            result = cache.get(key)
            if result is not None:
                return result

            # If not in cache, call the function
            result = func(*args, **kwargs)
            
            # Store in cache
            cache.set(key, result, expire=expire)
            return result
        return wrapper
    return decorator
