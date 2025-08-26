import Redis from 'ioredis';

// Create a Redis client with connection options
let redisClient: Redis;

try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    // password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
      // Retry connection with exponential backoff, max 2 seconds
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  // Log connection events
  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });

  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
  });
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  // Create a mock Redis client to prevent application crashes
  // when Redis is not available
  redisClient = {
    status: null,
    get: async () => null,
    setex: async () => 'OK',
    del: async () => 0,
    scan: async () => ['0', []],
  } as unknown as Redis;
}

export default redisClient;
