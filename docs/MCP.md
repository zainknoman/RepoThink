# RepoThink MCP integration

RepoThink now exposes an MCP-compatible local tool adapter through `frontend/src/mcp/tools.js`. It implements the JSON-RPC tool discovery and call shapes used by MCP hosts.

Tools: repothink.search, symbol, definition, references, callers, callees, dependencies, impact, tests, architecture, context, health, explain.

The adapter intentionally stays inside the local-first application. A future Node host can wrap the same intelligence functions with MCP stdio or Streamable HTTP transport.