const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        if (times > 3) {
            console.error('Redis connection failed after 3 retries');
            return null; // stop retrying
        }
        return Math.min(times * 200, 1000);
    }
});

redis.on('connect', () => console.log('✅ Redis Connected'));
redis.on('error',   (err) => console.error('❌ Redis Error:', err.message));

module.exports = redis;