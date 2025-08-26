import { Request, Response, NextFunction } from 'express';
import redisClient from '../utils/redis.client';

export const cacheMiddleware = (ttl = 60) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip cache if Redis is not ready or in development mode
    //   if (process.env.NODE_ENV === 'development' || !redisClient.status) {
    //     return next();
    //   }
      
      // Only cache GET requests
      if (req.method !== 'GET') return next();
      
      const userId = req.user?.id;
      if (!userId) return next();
      
      // Create a unique cache key based on the user, path, and query params
      const cacheKey = `${userId}:${req.path}:${JSON.stringify(req.query)}`;
      
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        // Return cached data
        return res.status(200).json(JSON.parse(cachedData));
      }
      
      // Store the original response.json method
      const originalJson = res.json;
      
      // Override response.json method to cache the response before sending
      res.json = function(body) {
        try {
          // Cache the response for future requests
          redisClient.setex(cacheKey, ttl, JSON.stringify(body))
            .catch(err => console.error('Redis cache set error:', err));
        } catch (e) {
          console.error('Error while setting cache:', e);
        }
        
        // Call the original json method
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Function to invalidate cache for a specific user or pattern
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    if (!redisClient.status) return;
    
    let keys: string[] = [];
    
    try {
      // Scan for keys matching pattern
      let cursor = '0';
      do {
        const [nextCursor, scanKeys] = await redisClient.scan(
          cursor, 
          'MATCH', 
          pattern, 
          'COUNT', 
          100
        );
        cursor = nextCursor;
        keys = keys.concat(scanKeys);
      } while (cursor !== '0');
      
      // Delete found keys
      if (keys.length > 0) {
        await redisClient.del(...keys);
        console.log(`Invalidated ${keys.length} cache entries with pattern: ${pattern}`);
      }
    } catch (e) {
      console.error('Error in cache scanning:', e);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};
