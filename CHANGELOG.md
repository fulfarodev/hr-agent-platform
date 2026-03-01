# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- CLAUDE.md project guidance for Claude Code
- Claude Code agent skills: NestJS, React, FastAPI, changelog-automation, LLM patterns, prompt engineering
- Claude Code local settings and skills lockfile
- Global WebSocket exception filter with structured `chat:error` events (BFF)
- DTO validation for `chat:message` payloads using class-validator (BFF)
- WebSocket validation pipe with whitelist and forbid non-whitelisted fields (BFF)
- LLM request/response logging with latency and token usage metrics (BFF)
- Retry with exponential backoff for transient LLM failures (429, 502–504, timeouts) (BFF)
- Graceful shutdown hooks via `app.enableShutdownHooks()` (BFF)
- Connection logging in WebSocket gateway (BFF)
- DM Sans and JetBrains Mono typography via Google Fonts (Web)
- Custom Tailwind color tokens: surface, ink, line (Web)

### Changed

- CORS origin in WebSocket gateway now reads from `CORS_ORIGIN` env var instead of hardcoded value (BFF)
- Agent loop messages array typed as `OpenAI.ChatCompletionMessageParam[]` instead of `any[]` (BFF)
- System prompt restructured with explicit Role/Context/Instructions/Constraints/Output sections (BFF)
- System prompt adds negative constraints to prevent hallucination and date assumptions (BFF)
- `main.ts` uses NestJS `Logger` instead of `console.log` (BFF)
- Frontend redesigned with minimalist warm-neutral zinc palette replacing indigo theme (Web)
- Message bubbles use `zinc-900` for user messages, white with zinc border for assistant (Web)
- Send button changed to `ArrowUp` icon with dark background (Web)
- Header simplified with text-based "HR" logo instead of Building2 icon (Web)
- Welcome screen uses staggered chip animations and cleaner typography (Web)
- Typing indicator uses opacity pulse animation instead of bounce (Web)
- Tool call cards use compact layout with JetBrains Mono for data display (Web)
- Scrollbar reduced to 4px with subtle hover state (Web)
- `sendMessage` callback stabilized with refs to avoid unnecessary re-renders (Web)
- `useChat` uses `isStreamingRef` to prevent stale closures in callbacks (Web)

## [0.1.0] - 2026-03-01

### Added

- React frontend with chat UI, streaming responses, and tool call visibility
- NestJS BFF with ReAct agent loop, LLM integration, MCP client, and session management
- Python MCP server with 4 HR tools: getRemainingVacationDays, requestTimeOff, getCompanyPolicy, getTeamCalendar
- Shared TypeScript packages: shared-types, api-client, tsconfig, eslint-config
- Docker Compose setup for Ollama LLM service
- Project documentation: README, architecture docs, and environment configuration

### Fixed

- Turbo v2 pipeline→tasks rename and moduleResolution for shared packages
- Strict TypeScript errors in BFF
