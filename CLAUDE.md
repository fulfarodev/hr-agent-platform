# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HR Agent Platform — an AI-powered HR assistant with a ReAct agent loop, real-time streaming chat, and MCP-based tool execution. Turborepo monorepo with npm workspaces.

## Commands

```bash
# Install all dependencies
npm install

# Run all apps in dev mode (BFF + Web)
npm run dev

# Run individual apps
npm run dev:bff          # NestJS BFF on :3001
npm run dev:web          # React frontend on :5173

# Build all packages and apps
npm run build

# Type-check across the monorepo
npm run type-check

# Lint
npm run lint

# MCP server setup (Python, separate from npm)
cd mcp-server && python -m venv .venv && pip install -e .
```

**Docker (Ollama LLM):**
```bash
docker compose up -d ollama
docker exec hr-agent-ollama ollama pull llama3.1:8b-instruct-q5_K_M
```

No test framework is configured yet.

## Architecture

```
apps/bff/         NestJS 10 — WebSocket gateway, ReAct agent loop, LLM + MCP clients
apps/web/         React 18 + Vite 5 — Chat UI with streaming and tool call visibility
mcp-server/       Python MCP server — 4 HR tools via stdio transport
packages/
  shared-types/   TypeScript interfaces shared across apps (ChatMessage, ToolCall, HR models)
  api-client/     HTTP (ky) + Socket.IO client wrapper
  tsconfig/       Shared TS configs: base.json, react.json, nestjs.json
  eslint-config/  Shared ESLint + Prettier config
```

### Key Data Flow

```
Browser ↔ Socket.IO ↔ ChatGateway (apps/bff/src/agent/agent.gateway.ts)
  → AgentService (agent.service.ts) runs ReAct loop (max 5 iterations)
    → LlmService calls Ollama via OpenAI-compatible API
    → McpService executes tools via stdio subprocess to Python MCP server
  ← Streams tokens back: chat:tool_call → chat:tool_result → chat:token → chat:done
```

### WebSocket Events (defined in `packages/shared-types/src/events.ts`)

- **Client→Server:** `chat:message { sessionId, content, employeeId }`
- **Server→Client:** `chat:token`, `chat:done`, `chat:tool_call`, `chat:tool_result`, `chat:error`

### BFF Module Organization

- `agent/` — Gateway + service implementing the ReAct agent loop with system prompt
- `llm/` — OpenAI SDK wrapper targeting Ollama (swap LLM by changing env vars)
- `mcp/` — MCP client + tool-mapper (converts MCP tools to OpenAI function-calling format)
- `session/` — In-memory session store with 20-message windowed history
- `health/` — Liveness/readiness endpoints

### MCP Server Tools (Python)

`getRemainingVacationDays`, `requestTimeOff`, `getCompanyPolicy`, `getTeamCalendar` — all use mock in-memory data in `mcp-server/src/data/`.

## Build System

- **Turborepo v2** with `tasks` (not legacy `pipeline`) in `turbo.json`
- `build` depends on `^build` (packages build before apps)
- `lint` and `type-check` depend on `^build`
- `dev` is persistent/no-cache

## TypeScript Configuration

- BFF extends `@hr-agent/tsconfig/nestjs.json` — CommonJS, node resolution, decorators enabled
- Web extends `@hr-agent/tsconfig/react.json` — ESNext, bundler resolution, react-jsx
- Both derive from `base.json` — strict mode, ES2020+, skipLibCheck

## Environment

Copy `.env.example` to `apps/bff/.env`. Key variables:
- `OLLAMA_BASE_URL` / `OLLAMA_MODEL` — LLM endpoint and model
- `MCP_SERVER_COMMAND` / `MCP_SERVER_ARGS` / `MCP_SERVER_CWD` — Python MCP subprocess config
- `AGENT_MAX_ITERATIONS` (default 5), `AGENT_TEMPERATURE` (default 0.3)
- `PORT` (BFF, default 3001), `CORS_ORIGIN` (default http://localhost:5173)
