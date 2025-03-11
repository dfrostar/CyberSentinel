declare module 'mcp-core' {
  interface MCPSecureChannel {
    constructor(config: MCPConnectionConfig);
    syncDirectory(path: string): Promise<MCPSyncResult>;
  }

  interface MCPConnectionConfig {
    apiKey: string;
    sessionValidator: (sessionId: string) => boolean;
    encryption: string;
  }

  interface MCPSyncResult {
    encrypted_count: number;
    access_rule_updates: number;
    metadata: {
      timestamp: string;
      signature: string;
    };
  }
}

export interface MCPDocument {
  path: string;
  encrypted_content: string;
  access_rules: string[];
  version_hash: string;
}
