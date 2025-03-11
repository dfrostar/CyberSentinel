/**
 * Rate Limiter Implementation
 * 
 * Provides configurable rate limiting for different API endpoints
 * to prevent abuse and ensure fair usage of resources.
 */
import { logger } from '../logger';

export interface RateLimitConfig {
  maxRequests: number;  // Maximum requests allowed in the time window
  windowMs: number;     // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;     // Whether the request is allowed
  remaining: number;    // Remaining requests in the current window
  resetTime: number;    // Time when the rate limit will reset (Unix timestamp)
}

/**
 * Rate limiting implementation for API endpoints
 */
export class RateLimiter {
  // Default rate limit configurations
  private readonly defaultLimits: Record<string, RateLimitConfig> = {
    'default': { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    'ai': { maxRequests: 10, windowMs: 60 * 1000 },       // 10 AI requests per minute
    'session': { maxRequests: 30, windowMs: 60 * 1000 }   // 30 session operations per minute
  };

  // Store for tracking request counts by IP and endpoint type
  private readonly requestCounts: Map<string, { count: number, resetTime: number }> = new Map();

  /**
   * Check if a request should be allowed based on rate limits
   * 
   * @param ip - IP address of the requester
   * @param type - Type of endpoint being accessed (default, ai, session)
   * @returns Result indicating if the request is allowed and metadata
   */
  check(ip: string, type: string = 'default'): RateLimitResult {
    // Get appropriate rate limit config
    const config = this.defaultLimits[type] || this.defaultLimits.default;
    
    // Create key for this IP and request type
    const key = `${ip}:${type}`;
    
    // Get current time
    const now = Date.now();
    
    // Get or initialize tracking for this key
    let tracking = this.requestCounts.get(key);
    if (!tracking || tracking.resetTime <= now) {
      tracking = {
        count: 0,
        resetTime: now + config.windowMs
      };
      this.requestCounts.set(key, tracking);
    }
    
    // Check if rate limit exceeded
    const isAllowed = tracking.count < config.maxRequests;
    
    // Increment counter if allowed
    if (isAllowed) {
      tracking.count++;
    } else {
      logger.warn(`Rate limit exceeded for ${key}`, {
        ip,
        type,
        count: tracking.count,
        limit: config.maxRequests,
        resetTime: new Date(tracking.resetTime).toISOString()
      });
    }
    
    return {
      allowed: isAllowed,
      remaining: Math.max(0, config.maxRequests - tracking.count),
      resetTime: tracking.resetTime
    };
  }

  /**
   * Reset rate limit tracking for a specific IP
   * Used primarily for testing and emergency resets
   * 
   * @param ip - IP address to reset
   */
  reset(ip: string): void {
    // Remove all entries for this IP
    for (const key of this.requestCounts.keys()) {
      if (key.startsWith(`${ip}:`)) {
        this.requestCounts.delete(key);
      }
    }
    
    logger.debug(`Rate limit counters reset for IP: ${ip}`);
  }
}
