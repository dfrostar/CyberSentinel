/**
 * Session API Implementation
 * 
 * Manages session lifecycle including creation, validation, and expiration
 * Incorporates memory usage tracking to ensure proper session cleanup
 */
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';

// Session storage type definition
interface Session {
  id: string;
  createdAt: number;
  lastUsed: number;
  usageCount: number;
  expiresAt: number;
  context?: any;
  isExpired: boolean;
}

/**
 * Session API service
 */
class SessionAPI {
  private sessions: Map<string, Session> = new Map();
  private readonly SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
  
  /**
   * Create a new session
   * @returns The ID of the created session
   */
  async createSession(): Promise<string> {
    const sessionId = uuidv4();
    const now = Date.now();
    
    const newSession: Session = {
      id: sessionId,
      createdAt: now,
      lastUsed: now,
      usageCount: 1,
      expiresAt: now + this.SESSION_EXPIRY_MS,
      isExpired: false
    };
    
    this.sessions.set(sessionId, newSession);
    logger.debug('Session created with ID:', sessionId, 'Current usage:', newSession.usageCount);
    
    // Schedule cleanup
    this.scheduleCleanup(sessionId);
    
    return sessionId;
  }
  
  /**
   * Validate if a session exists and is not expired
   * @param sessionId Session ID to validate
   * @returns True if the session is valid
   */
  async validateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      logger.debug('Session not found:', sessionId);
      return false;
    }
    
    if (session.isExpired || Date.now() > session.expiresAt) {
      logger.debug('Session expired:', sessionId);
      session.isExpired = true;
      return false;
    }
    
    // Update last used time and extend expiration
    session.lastUsed = Date.now();
    session.expiresAt = Date.now() + this.SESSION_EXPIRY_MS;
    session.usageCount++;
    
    logger.debug('Session validated:', sessionId, 'Current usage:', session.usageCount);
    return true;
  }
  
  /**
   * Force a session to be marked as expired
   * Used for testing and security controls
   * @param sessionId Session ID to expire
   * @returns True if session was found and expired
   */
  async markSessionExpired(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      logger.debug('Session not found for expiration:', sessionId);
      return false;
    }
    
    session.isExpired = true;
    session.expiresAt = Date.now() - 1; // Force immediate expiration
    
    logger.debug('Session manually expired:', sessionId);
    return true;
  }
  
  /**
   * Remove a session from the store
   * @param sessionId Session ID to remove
   * @returns True if session was found and removed
   */
  async removeSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      logger.debug('Session not found for removal:', sessionId);
      return false;
    }
    
    // Check if session is still in use
    if (session.usageCount > 0) {
      logger.warn('Attempted to remove active session:', sessionId);
      return false;
    }
    
    this.sessions.delete(sessionId);
    logger.debug('Session removed:', sessionId);
    return true;
  }
  
  /**
   * Check all sessions for expiration and clean up as needed
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    const expired: string[] = [];
    
    this.sessions.forEach((session, id) => {
      if (session.isExpired || now > session.expiresAt) {
        expired.push(id);
      }
    });
    
    if (expired.length > 0) {
      expired.forEach(id => {
        this.sessions.delete(id);
      });
      
      logger.debug(`Cleaned up ${expired.length} expired sessions`);
    }
  }
  
  /**
   * Schedule automatic cleanup for a session
   * @param sessionId Session ID to schedule cleanup for
   */
  private scheduleCleanup(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    // Calculate time until expiration
    const timeUntilExpiry = session.expiresAt - Date.now();
    
    // Schedule cleanup task
    setTimeout(() => {
      const currentSession = this.sessions.get(sessionId);
      if (currentSession && (currentSession.isExpired || Date.now() > currentSession.expiresAt)) {
        this.sessions.delete(sessionId);
        logger.debug('Scheduled cleanup of expired session:', sessionId);
      }
    }, timeUntilExpiry + 1000); // Add 1 second buffer
  }
}

export const sessionAPI = new SessionAPI();
