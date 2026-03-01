# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- CLAUDE.md project guidance for Claude Code
- Claude Code agent skills: NestJS, React, FastAPI, changelog-automation, LLM patterns, prompt engineering
- Claude Code local settings and skills lockfile

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
