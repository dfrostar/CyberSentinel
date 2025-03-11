# MCP Management Guide

## Installation
```bash
npm install @mcp/core@1.2.3
export MCP_API_KEY="your_key"
```

## Configuration
```yaml
# mcp-config.yml
api_version: 1.2
encryption:
  algorithm: xchacha20-poly1305
```

## Monitoring
```tsx
<MCPStatus /> // React component
```

## Troubleshooting
```bash
npx ts-node scripts/mcp-cli.ts verify
```

## Audit Logs
```powershell
gh api /repos/dtfro/CyberSentinel/actions/workflows/mcp-sync.yml/runs
```
