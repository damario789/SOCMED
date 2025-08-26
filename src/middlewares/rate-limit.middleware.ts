import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import redisClient from '../utils/redis.client';

// Create rate limiter with fallback for when Redis is not available
let rateLimiter: any;

try {
  rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rate_limit',
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
  });
} catch (error) {
  console.error('Failed to initialize rate limiter:', error);
  // Create a mock rate limiter that always succeeds
  rateLimiter = {
    consume: async () => Promise.resolve({}),
  };
}

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Skip rate limiting if in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  try {
    // Use IP as key if user is not authenticated
    const key = req.user ? String(req.user.id) : req.ip || 'unknown';
    
    await rateLimiter.consume(key);
    next();
  } catch (err) {
    res.status(429).json({ 
      error: 'Too many requests, please try again later' 
    });
  }
};
