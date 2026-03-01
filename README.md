# HR Assistant Agent

An AI-powered HR assistant for managing time off, built with a production-grade architecture.

## Architecture

**Monorepo (Turborepo)** → **React Frontend** → **NestJS BFF (Agent Orchestrator)** → **Ollama (Local LLM)** + **MCP Server (Python HR Tools)**

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design documentation.

## LLM Choice: Llama 3.1 8B Instruct (via Ollama)

### Why Llama 3.1 8B?
- **Data sovereignty**: Runs entirely local — no data leaves your infrastructure
- **Cost predictability**: Zero per-token costs, fixed infrastructure cost
- **OpenAI-compatible API**: The agent code is vendor-agnostic. Swap to Claude, GPT-4o, or vLLM by changing one env var
- **Native tool calling**: Llama 3.1 supports function calling out of the box
- **Multilingual**: Responds naturally in English and Spanish
- **Production path**: Today Ollama, tomorrow vLLM on Kubernetes with GPU autoscaling

### Why not a cloud API?
This architecture demonstrates the ability to own and operate AI infrastructure. In an enterprise context (HR/payroll data is sensitive), local inference removes third-party data processing concerns. The abstraction layer ensures we can switch to any OpenAI-compatible provider without code changes.

## 4th Tool: getTeamCalendar

I chose `getTeamCalendar` because time-off decisions don't happen in isolation. Before approving PTO, a responsible system checks team availability to prevent conflicts (e.g., entire engineering team off during a sprint). This demonstrates **systems thinking** — the agent considers organizational context, not just individual requests.

In production, this tool would connect to a real calendar system and enforce business rules like minimum team coverage.

## Assumptions

- **User identity**: Employee is selected via a dropdown in the UI (mock data with 3 employees). In production, this would come from an auth token (JWT/SSO).
- **Date handling**: All dates are ISO 8601 (YYYY-MM-DD). Business days exclude weekends. Timezone is server-local. In production, timezone would be employee-specific.
- **Data persistence**: In-memory for this demo. Session and request data reset on server restart. Production would use PostgreSQL + Redis.
- **Approval workflow**: Requests are auto-approved if balance is sufficient. Production would have a manager approval step.
- **Language detection**: The LLM naturally responds in the user's language (system prompt instructs this).

## Setup Instructions

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker (with NVIDIA GPU support for Ollama)
- npm 10+

### 1. Start Ollama
```bash
docker compose up -d ollama
docker exec hr-agent-ollama ollama pull llama3.1:8b-instruct-q5_K_M
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Python MCP server
```bash
cd mcp-server
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -e .
```

### 4. Configure environment
```bash
cp .env.example apps/bff/.env
# Edit values if needed
```

### 5. Run everything
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- BFF: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## What I'd Improve With More Time

1. **Streaming in the agent loop**: Currently, the tool-calling iterations use non-streaming calls. The final response streams, but intermediate "thinking" steps could stream too.
2. **Persistent storage**: Redis for sessions, PostgreSQL for request history and audit trail.
3. **Authentication**: JWT-based auth with role-based access (employee sees own data, manager sees team data, HR sees all).
4. **Observability**: OpenTelemetry traces for every agent loop iteration, token usage metrics, tool call latency histograms.
5. **Guardrails**: Input validation layer before the LLM (detect prompt injection, enforce max message length), output validation after (ensure no hallucinated data).
6. **Testing**: Integration tests for the agent loop with mocked LLM responses, E2E tests for the WebSocket flow.

## One Thing I'd Add for Production

**Agent Observability & Cost Tracking Pipeline**

Every agent interaction would emit structured traces (OpenTelemetry) containing:
- Token count (input + output) per LLM call
- Tool call frequency, latency, and error rates
- Number of agent loop iterations per request
- Session length and conversation complexity metrics

This data flows to a time-series database (Prometheus/InfluxDB) with Grafana dashboards. It enables:
- Cost projection and budgeting (tokens x model cost)
- Performance monitoring (p50/p95/p99 response times)
- Quality monitoring (error rates, fallback frequency)
- Capacity planning (when to scale from Ollama to vLLM cluster)
- A/B testing different models (route 10% traffic to Qwen2.5, compare quality)

Without this observability, you're flying blind in production. With it, you can make data-driven decisions about model selection, scaling, and cost optimization.
