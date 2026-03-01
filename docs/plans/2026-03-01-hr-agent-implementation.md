# HR Assistant Agent — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete HR Assistant Agent with Turborepo monorepo, React chat UI, NestJS BFF with ReAct agent loop, Python MCP server, and Ollama LLM integration.

**Architecture:** Turborepo monorepo with shared TS packages, React+Vite frontend communicating via WebSocket (socket.io) to a NestJS BFF that orchestrates a ReAct agent loop — calling tools on a Python MCP server (stdio) and streaming LLM responses from Ollama.

**Tech Stack:** TypeScript, React, Vite, TailwindCSS, NestJS, socket.io, OpenAI SDK (→Ollama), MCP SDK (stdio), Python 3.11+, Docker Compose.

**Spec file:** `C:\Users\jfulf\Downloads\HR_AGENT_SPEC.md` — the complete source of truth for all code, interfaces, and behavior.

---

## Dependency Graph & Parallelism

```
Task 1 (Monorepo Init)
  ├── Task 2 (tsconfig)
  ├── Task 3 (eslint-config)
  │     ├── Task 4 (shared-types)  ← depends on 2,3
  │     │     ├── Task 5 (api-client) ← depends on 4
  │     │     ├── Task 7 (BFF) ← depends on 4
  │     │     └── Task 8 (Frontend) ← depends on 5,7
  │     │
  Task 6 (MCP Server — Python, independent after Task 1)
  Task 9 (Docker + Docs — independent after Task 1)
```

**Parallel lanes:**
- **Lane A (after Task 1):** Tasks 2,3 → 4 → 5 → 8 (TS packages → frontend)
- **Lane B (after Task 1):** Task 6 (Python MCP server — fully independent)
- **Lane C (after Task 4):** Task 7 (NestJS BFF)
- **Lane D (after Task 1):** Task 9 (Docker, env, docs)

---

### Task 1: Initialize Turborepo Monorepo

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.npmrc` (if needed)

**Step 1: Initialize git repo**

```bash
cd D:/monaccode/hr-agent-platform
git init
```

**Step 2: Create root package.json**

Create `package.json`:
```json
{
  "name": "hr-agent",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "dev:bff": "turbo run dev --filter=bff",
    "dev:web": "turbo run dev --filter=web"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "npm@10.0.0"
}
```

**Step 3: Create turbo.json**

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Step 4: Create .gitignore**

Create `.gitignore`:
```
node_modules/
dist/
build/
.next/
.turbo/
*.tsbuildinfo
.env
.env.local
.env.*.local
__pycache__/
*.pyc
.venv/
*.egg-info/
.pytest_cache/
```

**Step 5: Create directory scaffolding**

```bash
mkdir -p packages/tsconfig packages/eslint-config packages/shared-types/src packages/api-client/src
mkdir -p apps/web/src/components apps/web/src/hooks apps/web/src/lib
mkdir -p apps/bff/src/agent apps/bff/src/llm apps/bff/src/mcp apps/bff/src/session apps/bff/src/health apps/bff/src/config
mkdir -p mcp-server/src/tools mcp-server/src/data
```

**Step 6: Install turbo and commit**

```bash
npm install
git add -A
git commit -m "chore: initialize turborepo monorepo scaffold"
```

---

### Task 2: packages/tsconfig — Shared TypeScript Configs

**Depends on:** Task 1

**Files:**
- Create: `packages/tsconfig/package.json`
- Create: `packages/tsconfig/base.json`
- Create: `packages/tsconfig/react.json`
- Create: `packages/tsconfig/nestjs.json`

**Step 1: Create package.json**

Create `packages/tsconfig/package.json`:
```json
{
  "name": "@hr-agent/tsconfig",
  "version": "0.0.0",
  "private": true,
  "files": ["base.json", "react.json", "nestjs.json"]
}
```

**Step 2: Create base.json**

Create `packages/tsconfig/base.json`:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create react.json**

Create `packages/tsconfig/react.json`:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "noEmit": true
  }
}
```

**Step 4: Create nestjs.json**

Create `packages/tsconfig/nestjs.json`:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "declaration": true
  }
}
```

**Step 5: Commit**

```bash
git add packages/tsconfig/
git commit -m "chore: add shared tsconfig package"
```

---

### Task 3: packages/eslint-config — Shared ESLint Config

**Depends on:** Task 1

**Files:**
- Create: `packages/eslint-config/package.json`
- Create: `packages/eslint-config/index.js`

**Step 1: Create package.json**

Create `packages/eslint-config/package.json`:
```json
{
  "name": "@hr-agent/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint-config-prettier": "^9.0.0"
  },
  "peerDependencies": {
    "eslint": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Step 2: Create index.js**

Create `packages/eslint-config/index.js`:
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
```

**Step 3: Commit**

```bash
git add packages/eslint-config/
git commit -m "chore: add shared eslint config package"
```

---

### Task 4: packages/shared-types — TypeScript Interfaces

**Depends on:** Tasks 2, 3

**Files:**
- Create: `packages/shared-types/package.json`
- Create: `packages/shared-types/tsconfig.json`
- Create: `packages/shared-types/src/index.ts`
- Create: `packages/shared-types/src/chat.ts`
- Create: `packages/shared-types/src/hr.ts`
- Create: `packages/shared-types/src/events.ts`

**Step 1: Create package.json**

Create `packages/shared-types/package.json`:
```json
{
  "name": "@hr-agent/shared-types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "tsc"
  },
  "devDependencies": {
    "@hr-agent/tsconfig": "*",
    "typescript": "^5.4.0"
  }
}
```

**Step 2: Create tsconfig.json**

Create `packages/shared-types/tsconfig.json`:
```json
{
  "extends": "@hr-agent/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

**Step 3: Create src/chat.ts**

Create `packages/shared-types/src/chat.ts` — exact code from spec section 4.1:
```typescript
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  toolCallId?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  toolName: string;
  result: unknown;
  isError: boolean;
}

export interface SessionInfo {
  sessionId: string;
  employeeId: string;
  createdAt: number;
  messageCount: number;
}
```

**Step 4: Create src/hr.ts**

Create `packages/shared-types/src/hr.ts` — exact code from spec section 4.1:
```typescript
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  teamId: string;
  managerId: string;
  vacationBalance: VacationBalance;
}

export interface VacationBalance {
  total: number;
  used: number;
  remaining: number;
  pending: number;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: string;
}

export interface CompanyPolicy {
  topic: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface TeamCalendarEntry {
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending';
}
```

**Step 5: Create src/events.ts**

Create `packages/shared-types/src/events.ts` — exact code from spec:
```typescript
export interface ClientToServerEvents {
  'chat:message': (payload: { sessionId: string; content: string; employeeId?: string }) => void;
}

export interface ServerToClientEvents {
  'session:created': (payload: { sessionId: string }) => void;
  'chat:token': (payload: { token: string; messageId: string }) => void;
  'chat:tool_call': (payload: { toolName: string; args: Record<string, unknown>; status: 'executing' }) => void;
  'chat:tool_result': (payload: { toolName: string; result: unknown; status: 'completed' | 'error' }) => void;
  'chat:done': (payload: { messageId: string; fullContent: string }) => void;
  'chat:error': (payload: { error: string; code: string }) => void;
}
```

**Step 6: Create src/index.ts**

Create `packages/shared-types/src/index.ts`:
```typescript
export * from './chat';
export * from './hr';
export * from './events';
```

**Step 7: Commit**

```bash
git add packages/shared-types/
git commit -m "feat: add shared-types package with chat, HR, and event interfaces"
```

---

### Task 5: packages/api-client — HTTP + WebSocket Client SDK

**Depends on:** Task 4

**Files:**
- Create: `packages/api-client/package.json`
- Create: `packages/api-client/tsconfig.json`
- Create: `packages/api-client/src/index.ts`
- Create: `packages/api-client/src/client.ts`
- Create: `packages/api-client/src/socket.ts`
- Create: `packages/api-client/src/types.ts`

**Step 1: Create package.json**

Create `packages/api-client/package.json`:
```json
{
  "name": "@hr-agent/api-client",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "tsc"
  },
  "dependencies": {
    "ky": "^1.2.0",
    "socket.io-client": "^4.7.0"
  },
  "peerDependencies": {
    "@hr-agent/shared-types": "*"
  },
  "devDependencies": {
    "@hr-agent/tsconfig": "*",
    "@hr-agent/shared-types": "*",
    "typescript": "^5.4.0"
  }
}
```

**Step 2: Create tsconfig.json**

Create `packages/api-client/tsconfig.json`:
```json
{
  "extends": "@hr-agent/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

**Step 3: Create src/client.ts**

Create `packages/api-client/src/client.ts` — from spec section 4.2:
```typescript
import ky from 'ky';
import type { SessionInfo } from '@hr-agent/shared-types';

export class HRAgentClient {
  private http: typeof ky;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.http = ky.create({ prefixUrl: baseUrl });
  }

  async healthCheck(): Promise<{ status: string; ollama: boolean; mcp: boolean }> {
    return this.http.get('health').json();
  }

  async getSessions(): Promise<SessionInfo[]> {
    return this.http.get('sessions').json();
  }
}
```

**Step 4: Create src/socket.ts**

Create `packages/api-client/src/socket.ts` — from spec section 4.2:
```typescript
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@hr-agent/shared-types';

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface ChatSocketOptions {
  url?: string;
  onToken: (data: { token: string; messageId: string }) => void;
  onToolCall: (data: { toolName: string; args: Record<string, unknown>; status: string }) => void;
  onToolResult: (data: { toolName: string; result: unknown; status: string }) => void;
  onDone: (data: { messageId: string; fullContent: string }) => void;
  onError: (data: { error: string; code: string }) => void;
  onSessionCreated: (data: { sessionId: string }) => void;
}

export function createChatSocket(options: ChatSocketOptions): ChatSocket {
  const socket: ChatSocket = io(options.url ?? 'http://localhost:3001', {
    transports: ['websocket'],
  });

  socket.on('chat:token', options.onToken);
  socket.on('chat:tool_call', options.onToolCall);
  socket.on('chat:tool_result', options.onToolResult);
  socket.on('chat:done', options.onDone);
  socket.on('chat:error', options.onError);
  socket.on('session:created', options.onSessionCreated);

  return socket;
}
```

**Step 5: Create src/types.ts and src/index.ts**

Create `packages/api-client/src/types.ts`:
```typescript
export type { ChatMessage, ToolCall, ToolResult, SessionInfo } from '@hr-agent/shared-types';
export type { ClientToServerEvents, ServerToClientEvents } from '@hr-agent/shared-types';
```

Create `packages/api-client/src/index.ts`:
```typescript
export { HRAgentClient } from './client';
export { createChatSocket } from './socket';
export type { ChatSocket, ChatSocketOptions } from './socket';
export * from './types';
```

**Step 6: Commit**

```bash
git add packages/api-client/
git commit -m "feat: add api-client package with HTTP and WebSocket client"
```

---

### Task 6: mcp-server/ — Python MCP Server (PARALLEL — independent)

**Depends on:** Task 1 only (no TS dependency)

**Files:**
- Create: `mcp-server/pyproject.toml`
- Create: `mcp-server/src/__init__.py`
- Create: `mcp-server/src/server.py`
- Create: `mcp-server/src/data/__init__.py`
- Create: `mcp-server/src/data/employees.py`
- Create: `mcp-server/src/data/policies.py`
- Create: `mcp-server/src/data/calendar.py`
- Create: `mcp-server/src/tools/__init__.py`
- Create: `mcp-server/src/tools/vacation.py`
- Create: `mcp-server/src/tools/time_off.py`
- Create: `mcp-server/src/tools/policy.py`
- Create: `mcp-server/src/tools/team_calendar.py`

**Step 1: Create pyproject.toml**

Create `mcp-server/pyproject.toml`:
```toml
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "hr-tools-mcp"
version = "0.1.0"
description = "HR Tools MCP Server"
requires-python = ">=3.11"
dependencies = [
    "mcp>=1.0.0",
    "pydantic>=2.0",
    "python-dateutil>=2.8",
]

[tool.setuptools.packages.find]
where = ["."]
```

**Step 2: Create __init__.py files**

Create empty `mcp-server/src/__init__.py`, `mcp-server/src/data/__init__.py`, `mcp-server/src/tools/__init__.py`.

**Step 3: Create src/data/employees.py**

Exact code from spec section 4.5 — `EMPLOYEES` dict with EMP001, EMP002, EMP003.

**Step 4: Create src/data/policies.py**

Exact code from spec — `POLICIES` dict with vacation, sick_leave, remote_work, parental_leave, holidays, bereavement.

**Step 5: Create src/data/calendar.py**

Exact code from spec — `TEAM_MEMBERS` dict, `generate_mock_calendar()` function.

**Step 6: Create src/tools/vacation.py**

Exact code from spec — `get_remaining_vacation_days(employee_id)`.

**Step 7: Create src/tools/time_off.py**

Exact code from spec — `request_time_off(employee_id, start_date, end_date, reason)` with `calculate_business_days` helper. Fix the `__import__` hack: use proper `from datetime import timedelta` import at top.

**Step 8: Create src/tools/policy.py**

Exact code from spec — `get_company_policy(topic)`.

**Step 9: Create src/tools/team_calendar.py**

Exact code from spec — `get_team_calendar(team_id, start_date, end_date)`.

**Step 10: Create src/server.py**

Exact code from spec — MCP server with `list_tools()` and `call_tool()` handlers, `main()` with `stdio_server`.

**Step 11: Test the MCP server runs**

```bash
cd mcp-server
python -m venv .venv
source .venv/Scripts/activate   # Windows
pip install -e .
python -c "from src.tools.vacation import get_remaining_vacation_days; print(get_remaining_vacation_days('EMP001'))"
```

Expected: prints the vacation balance dict for EMP001.

**Step 12: Commit**

```bash
git add mcp-server/
git commit -m "feat: add Python MCP server with 4 HR tools and mock data"
```

---

### Task 7: apps/bff — NestJS Backend

**Depends on:** Task 4 (shared-types)

**Files:**
- Create: `apps/bff/package.json`
- Create: `apps/bff/tsconfig.json`
- Create: `apps/bff/tsconfig.build.json`
- Create: `apps/bff/nest-cli.json`
- Create: `apps/bff/src/main.ts`
- Create: `apps/bff/src/app.module.ts`
- Create: `apps/bff/src/config/configuration.ts`
- Create: `apps/bff/src/llm/llm.module.ts`
- Create: `apps/bff/src/llm/llm.service.ts`
- Create: `apps/bff/src/llm/llm.types.ts`
- Create: `apps/bff/src/mcp/mcp.module.ts`
- Create: `apps/bff/src/mcp/mcp.service.ts`
- Create: `apps/bff/src/mcp/tool-mapper.ts`
- Create: `apps/bff/src/session/session.module.ts`
- Create: `apps/bff/src/session/session.service.ts`
- Create: `apps/bff/src/agent/agent.module.ts`
- Create: `apps/bff/src/agent/agent.service.ts`
- Create: `apps/bff/src/agent/agent.gateway.ts`
- Create: `apps/bff/src/agent/system-prompt.ts`
- Create: `apps/bff/src/health/health.module.ts`
- Create: `apps/bff/src/health/health.controller.ts`

**Step 1: Create package.json**

Create `apps/bff/package.json`:
```json
{
  "name": "bff",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@nestjs/core": "^10.3.0",
    "@nestjs/common": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/websockets": "^10.3.0",
    "@nestjs/platform-socket.io": "^10.3.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/swagger": "^7.3.0",
    "@hr-agent/shared-types": "*",
    "socket.io": "^4.7.0",
    "openai": "^4.50.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "uuid": "^9.0.0",
    "rxjs": "^7.8.0",
    "reflect-metadata": "^0.2.0"
  },
  "devDependencies": {
    "@hr-agent/tsconfig": "*",
    "@nestjs/cli": "^10.3.0",
    "@types/uuid": "^9.0.0",
    "typescript": "^5.4.0"
  }
}
```

**Step 2: Create tsconfig.json and tsconfig.build.json**

Create `apps/bff/tsconfig.json`:
```json
{
  "extends": "@hr-agent/tsconfig/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./"
  },
  "include": ["src"]
}
```

Create `apps/bff/tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts"]
}
```

**Step 3: Create nest-cli.json**

Create `apps/bff/nest-cli.json`:
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

**Step 4: Create src/config/configuration.ts**

Exact code from spec section 4.4.

**Step 5: Create src/llm/llm.types.ts**

Create `apps/bff/src/llm/llm.types.ts`:
```typescript
export interface LlmConfig {
  baseUrl: string;
  model: string;
}
```

**Step 6: Create src/llm/llm.service.ts**

Implement using OpenAI SDK pointed at Ollama. Key methods:
- `chatStream(messages, tools)` — returns async iterable
- `chat(messages, tools)` — returns full response
- `isAvailable()` — health check

Use `new OpenAI({ baseURL: config.ollama.baseUrl, apiKey: 'ollama' })`.
For streaming use `client.chat.completions.create({ stream: true })`.
Handle Ollama unavailability with clear error.

**Step 7: Create src/llm/llm.module.ts**

NestJS module exporting LlmService.

**Step 8: Create src/mcp/tool-mapper.ts**

Exact code from spec — `mcpToolsToOpenAI()` function.

**Step 9: Create src/mcp/mcp.service.ts**

Exact code from spec — MCP Client using `StdioClientTransport`. Implements `OnModuleInit` and `OnModuleDestroy`. Cache `listTools()` result on init. Add `isConnected()` method.

**Step 10: Create src/mcp/mcp.module.ts**

NestJS module exporting McpService.

**Step 11: Create src/session/session.service.ts**

Exact code from spec — in-memory Map, methods: `create()`, `get()`, `addMessage()`, `getHistory(limit=20)`.

**Step 12: Create src/session/session.module.ts**

NestJS module exporting SessionService.

**Step 13: Create src/agent/system-prompt.ts**

Exact code from spec — `buildSystemPrompt(employeeId)` with all behavior rules. Add current date injection.

**Step 14: Create src/agent/agent.service.ts**

Core ReAct loop from spec section 4.4. Critical implementation notes:
- Non-streaming for tool-calling iterations
- Streaming for final response only
- Handle both text AND tool calls in same message
- Handle tool execution errors gracefully (feed back as tool result)
- Max 5 iterations
- Add current date to context

**Step 15: Create src/agent/agent.gateway.ts**

WebSocket gateway from spec — `handleConnection()` creates session, `handleMessage()` calls agent.processMessage with callbacks.

**Step 16: Create src/agent/agent.module.ts**

NestJS module importing LlmModule, McpModule, SessionModule; providing AgentService, AgentGateway.

**Step 17: Create src/health/health.controller.ts**

Exact code from spec — GET /health endpoint checking ollama and mcp status.

**Step 18: Create src/health/health.module.ts**

NestJS module importing LlmModule, McpModule.

**Step 19: Create src/app.module.ts**

Root module importing ConfigModule (with `configuration`), AgentModule, HealthModule.

**Step 20: Create src/main.ts**

Bootstrap NestJS on port 3001, enable CORS for `http://localhost:5173`, enable Swagger at `/api/docs`.

**Step 21: Commit**

```bash
git add apps/bff/
git commit -m "feat: add NestJS BFF with agent loop, LLM, MCP, and session services"
```

---

### Task 8: apps/web — React Frontend

**Depends on:** Task 5 (api-client)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/index.css`
- Create: `apps/web/src/lib/constants.ts`
- Create: `apps/web/src/hooks/useChat.ts`
- Create: `apps/web/src/hooks/useAutoScroll.ts`
- Create: `apps/web/src/components/ChatWindow.tsx`
- Create: `apps/web/src/components/MessageBubble.tsx`
- Create: `apps/web/src/components/ToolCallCard.tsx`
- Create: `apps/web/src/components/InputBar.tsx`
- Create: `apps/web/src/components/TypingIndicator.tsx`
- Create: `apps/web/src/components/SessionHeader.tsx`
- Create: `apps/web/src/components/WelcomeScreen.tsx`

**Step 1: Create package.json**

Create `apps/web/package.json`:
```json
{
  "name": "web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@hr-agent/api-client": "*",
    "@hr-agent/shared-types": "*",
    "socket.io-client": "^4.7.0",
    "lucide-react": "^0.370.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@hr-agent/tsconfig": "*",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "typescript": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0"
  }
}
```

**Step 2: Create config files**

Create `apps/web/tsconfig.json`:
```json
{
  "extends": "@hr-agent/tsconfig/react.json",
  "compilerOptions": {
    "baseUrl": "."
  },
  "include": ["src"]
}
```

Create `apps/web/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
```

Create `apps/web/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

Create `apps/web/postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 3: Create index.html and entry files**

Create `apps/web/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HR Assistant</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `apps/web/src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `apps/web/src/index.css` — Tailwind directives + custom styles for the HR SaaS aesthetic.

Create `apps/web/src/lib/constants.ts`:
```typescript
export const API_URL = 'http://localhost:3001';
export const EMPLOYEES = [
  { id: 'EMP001', name: 'María García', department: 'Engineering' },
  { id: 'EMP002', name: 'Carlos López', department: 'Marketing' },
  { id: 'EMP003', name: 'Ana Martínez', department: 'Product' },
];
```

**Step 4: Create hooks**

Create `apps/web/src/hooks/useChat.ts` — core chat hook per spec section 4.3:
- Creates socket via `createChatSocket()` on mount
- State: messages, isStreaming, currentStreamingMessage, sessionId, activeToolCall
- `sendMessage(content)` emits `chat:message`
- Handlers for all socket events

Create `apps/web/src/hooks/useAutoScroll.ts`:
- Ref to scroll container
- Auto-scroll on new content unless user scrolled up

**Step 5: Create all components**

Per spec section 4.3:
- `SessionHeader.tsx` — employee selector dropdown (EMP001/002/003)
- `WelcomeScreen.tsx` — title, subtitle, 4 suggestion chips
- `ChatWindow.tsx` — main layout: header + messages area + input bar
- `MessageBubble.tsx` — user (right, accent) / assistant (left, white/gray)
- `ToolCallCard.tsx` — collapsible card with icon, tool name, args, result
- `InputBar.tsx` — fixed bottom, rounded input + send button
- `TypingIndicator.tsx` — 3 animated dots

Design direction: Clean HR SaaS (Rippling/Gusto vibes). Slate grays + indigo-600/violet-600 accent. Framer-motion entrance animations.

**Step 6: Create App.tsx**

Compose all components. Use `useChat` hook as single source of truth.

**Step 7: Commit**

```bash
git add apps/web/
git commit -m "feat: add React frontend with chat UI, streaming, and tool call visibility"
```

---

### Task 9: Docker, Environment, and Documentation

**Depends on:** Task 1 only (can run in parallel)

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `README.md`
- Create: `ARCHITECTURE.md`

**Step 1: Create docker-compose.yml**

Exact code from spec section 5 — Ollama service with GPU support, volume, healthcheck.

**Step 2: Create .env.example**

Exact code from spec section 7.

**Step 3: Create README.md**

Exact content from spec section 8 — architecture overview, LLM choice rationale, 4th tool explanation, assumptions, setup instructions, improvement ideas.

**Step 4: Create ARCHITECTURE.md**

Per spec section 9 — end-to-end flow, session management, tool design, ambiguity handling, tradeoffs table, scaling path diagram, limitations.

**Step 5: Commit**

```bash
git add docker-compose.yml .env.example README.md ARCHITECTURE.md
git commit -m "docs: add Docker Compose, env config, README, and architecture docs"
```

---

### Task 10: Install Dependencies and Verify Build

**Depends on:** All previous tasks

**Step 1: Install all npm dependencies**

```bash
cd D:/monaccode/hr-agent-platform
npm install
```

**Step 2: Verify type-checking**

```bash
npm run type-check
```

Fix any type errors.

**Step 3: Verify MCP server**

```bash
cd mcp-server
python -m venv .venv
source .venv/Scripts/activate
pip install -e .
python -c "from src.tools.vacation import get_remaining_vacation_days; print(get_remaining_vacation_days('EMP001'))"
```

**Step 4: Verify frontend builds**

```bash
cd D:/monaccode/hr-agent-platform
npx turbo run build --filter=web
```

**Step 5: Verify BFF builds**

```bash
npx turbo run build --filter=bff
```

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: verify all packages build successfully"
```

---

## Agent Team Assignment

For parallel execution with a team of agents:

| Agent | Tasks | Description |
|---|---|---|
| **foundation** | 1, 2, 3 | Monorepo init + config packages |
| **types-and-client** | 4, 5 | Shared types + API client (after foundation) |
| **mcp-server** | 6 | Python MCP server (parallel after Task 1) |
| **bff** | 7 | NestJS backend (after Task 4) |
| **frontend** | 8 | React frontend (after Task 5) |
| **docs** | 9 | Docker, env, docs (parallel after Task 1) |
| **lead** | 10 | Integration verification (after all) |
