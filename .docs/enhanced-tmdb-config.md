# Enhanced TMDB Service Configuration

## Environment Variables

You can customize the TMDB service behavior using these environment variables:

### Cache Settings
```bash
# Cache TTL in minutes (default: 60)
TMDB_CACHE_TTL_MINUTES=120

# Maximum cache size (default: 1000)
TMDB_CACHE_MAX_SIZE=2000
```

### Request Settings
```bash
# Request timeout in seconds (default: 30.0)
TMDB_TIMEOUT_SECONDS=45.0

# Maximum retry attempts (default: 3)
TMDB_MAX_RETRIES=5

# Retry delay in seconds (default: 1.0)
TMDB_RETRY_DELAY=2.0
```

### Result Limits
```bash
# Maximum search results (default: 100)
TMDB_MAX_SEARCH_RESULTS=200

# Maximum cast members to return (default: 15)
TMDB_MAX_CAST_MEMBERS=20
```

### Logging
```bash
# Log level: DEBUG, INFO, WARNING, ERROR (default: INFO)
TMDB_LOG_LEVEL=DEBUG

# Enable request logging (default: true)
TMDB_LOG_REQUESTS=true

# Enable performance logging (default: true)
TMDB_LOG_PERFORMANCE=true
```

## Example .env File

```env
# TMDB API Configuration
TMDB_API_KEY=your_api_key_here

# Performance Tuning
TMDB_CACHE_TTL_MINUTES=90
TMDB_CACHE_MAX_SIZE=1500
TMDB_TIMEOUT_SECONDS=40.0
TMDB_MAX_RETRIES=4

# Result Limits
TMDB_MAX_SEARCH_RESULTS=150
TMDB_MAX_CAST_MEMBERS=20

# Logging
TMDB_LOG_LEVEL=INFO
TMDB_LOG_REQUESTS=true
TMDB_LOG_PERFORMANCE=true
```

## Enhanced Features

### 1. Intelligent Caching
- **LRU Cache**: Automatically evicts least recently used items
- **TTL Support**: Items expire after configured time
- **Performance Tracking**: Monitor cache hit rates and performance
- **Statistics**: Detailed cache metrics available

### 2. Error Handling & Resilience
- **Retry Logic**: Automatic retry with exponential backoff
- **Rate Limit Handling**: Smart waiting for rate limit recovery
- **Network Error Recovery**: Handles connection issues gracefully
- **Detailed Error Messages**: More informative error reporting

### 3. Performance Optimization
- **Concurrent Requests**: Uses asyncio.gather for parallel API calls
- **Connection Pooling**: Efficient HTTP connection management
- **Rate Limiting**: Respects TMDB API limits (40 requests per 10 seconds)
- **Request Batching**: Optimized for multiple concurrent operations

### 4. Data Validation & Safety
- **Type Safety**: Comprehensive TypedDict definitions
- **Runtime Validation**: Validates API responses for required fields
- **Safe Data Extraction**: Handles missing or malformed data gracefully
- **Input Sanitization**: Cleans and validates input data

### 5. Monitoring & Debugging
- **Performance Metrics**: Track request durations and success rates
- **Cache Statistics**: Monitor cache effectiveness
- **Structured Logging**: Detailed logs for debugging
- **Error Tracking**: Comprehensive error reporting

## Usage Examples

### Basic Usage
```python
from app.services.tmdb import TMDBService

# Create service with default configuration
service = TMDBService(api_key="your_key")

# Search for content
results = await service.search_multi("Batman")
```

### Custom Configuration
```python
from app.services.tmdb import TMDBService
from app.services.config import TMDBConfig

# Create custom configuration
config = TMDBConfig(
    api_key="your_key",
    cache_ttl_minutes=120,
    max_retries=5,
    timeout_seconds=45.0
)

# Create service with custom config
service = TMDBService.from_config(config)
```

### Performance Monitoring
```python
# Get cache statistics
cache_stats = service.cache.get_stats()
print(f"Cache hit rate: {cache_stats['hit_rate_percent']}%")

# Get performance metrics
perf_stats = service.performance_tracker.get_overall_stats()
print(f"Average request time: {perf_stats['avg_duration_ms']}ms")
```

### Error Handling
```python
try:
    results = await service.search_multi("query")
except TMDBError as e:
    if e.status_code == 429:
        print("Rate limited - wait and retry")
    elif e.status_code == 401:
        print("Invalid API key")
    else:
        print(f"API error: {e.message}")
```

## Performance Tips

1. **Enable Caching**: Cache significantly reduces API calls and improves response times
2. **Tune Cache TTL**: Balance between fresh data and API usage
3. **Monitor Metrics**: Use performance tracking to identify bottlenecks
4. **Batch Requests**: Use concurrent operations for multiple API calls
5. **Handle Errors**: Implement proper error handling for production use

## API Rate Limits

The enhanced service automatically handles TMDB API rate limits:
- **Limit**: 40 requests per 10 seconds
- **Behavior**: Automatically waits when limit is reached
- **Burst Support**: Allows short bursts up to the limit
- **Monitoring**: Tracks rate limit usage and wait times
