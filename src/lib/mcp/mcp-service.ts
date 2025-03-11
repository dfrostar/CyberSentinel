import { MCPSecureChannel } from 'mcp-core';
import { auditSecurity } from '../security/audit';
import logger from '../logger';
import { MCPDocument } from '../../types/mcp';

export class MCPService {
  private static instance: MCPService;
  private channel: MCPSecureChannel;

  private constructor(apiKey: string) {
    this.channel = new MCPSecureChannel({
      apiKey,
      sessionValidator: this.validateSession.bind(this),
      encryption: process.env.MCP_ENCRYPTION_KEY!
    });
  }

  public static initialize(apiKey: string) {
    if (!MCPService.instance) {
      MCPService.instance = new MCPService(apiKey);
    }
    return MCPService.instance;
  }

  private validateSession(sessionId: string) {
    const isValid = auditSecurity.checkSessionValidity(sessionId);
    logger.info(`MCP session validation result: ${isValid}`);
    return isValid;
  }

  public async syncDocuments(): Promise<MCPDocument[]> {
    try {
      const syncResult = await this.channel.syncDirectory('./docs');
      auditSecurity.recordMCPSync(syncResult.metadata);
      return syncResult.documents;
    } catch (error) {
      logger.error('MCP sync failed:', error);
      auditSecurity.logSecurityEvent({
        eventType: 'MCP_SYNC_FAILURE',
        severity: 'CRITICAL'
      });
      throw error;
    }
  }
}
