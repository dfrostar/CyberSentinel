#!/usr/bin/env node
import { MCPService } from '../src/lib/mcp/mcp-service';
import dotenv from 'dotenv';

dotenv.config();

const [,, command] = process.argv;

async function main() {
  const apiKey = process.env.MCP_API_KEY!;
  const mcpService = MCPService.initialize(apiKey);

  switch(command) {
    case 'sync':
      await mcpService.syncDocuments();
      console.log('Documents synced successfully');
      break;
    case 'status':
      // Implementation needed
      break;
    default:
      console.error('Invalid command');
      process.exit(1);
  }
}

main().catch(console.error);
