import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✓ Redis connected');
});

// Connect to Redis
await redisClient.connect();

// Helper functions for common operations
export const cache = {
  get: async (key) => {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  set: async (key, value, expirationInSeconds = 3600) => {
    try {
      await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  del: async (key) => {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  // For rate limiting
  incrementCounter: async (key, expirationInSeconds = 60) => {
    try {
      const count = await redisClient.incr(key);
      if (count === 1) {
        await redisClient.expire(key, expirationInSeconds);
      }
      return count;
    } catch (error) {
      console.error('Redis INCR error:', error);
      return null;
    }
  }
};

export default redisClient;
