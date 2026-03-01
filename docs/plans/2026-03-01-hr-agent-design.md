# HR Assistant Agent — Design Document

## Overview

Build an HR Assistant Agent for a take-home challenge. Full spec at `HR_AGENT_SPEC.md`.

## Architecture

Turborepo monorepo with 6 packages:

- **packages/tsconfig** — shared TS configs
- **packages/eslint-config** — shared lint config
- **packages/shared-types** — TypeScript interfaces (chat, HR, WebSocket events)
- **packages/api-client** — HTTP (ky) + WebSocket (socket.io) client SDK
- **apps/web** — React + Vite + TailwindCSS chat UI
- **apps/bff** — NestJS backend with ReAct agent loop, MCP client, LLM client
- **mcp-server/** — Python MCP server with 4 HR tools (stdio transport)
- **Docker Compose** — Ollama container for local LLM inference

## Agent Loop

ReAct-style: LLM call → tool calls → execute via MCP → feed results → loop (max 5 iterations).
Final response streams via WebSocket (socket.io).

## Tools

1. `getRemainingVacationDays` — check vacation balance
2. `requestTimeOff` — submit PTO (validates dates, checks balance)
3. `getCompanyPolicy` — query HR policies
4. `getTeamCalendar` — check team availability

## Implementation Order

Per spec section 10: monorepo → tsconfig → eslint → shared-types → api-client → mcp-server → bff → web → docker → docs.

## Design Decision

The spec is prescriptive and complete. No deviations needed. Implementation follows the spec exactly.
