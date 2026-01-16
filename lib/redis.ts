import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not defined. Redis client will fail if used.')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079', // Fallback for preventing instant crash if vars missing
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'example_token',
})
