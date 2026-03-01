# Architecture

## End-to-End Flow

When a user sends a message, it travels through the following path:

1. **User input**: The user types a message in the React frontend chat UI.
2. **WebSocket transport**: The message is emitted via Socket.IO as a `chat:message` event containing the `sessionId` and `content`.
3. **NestJS Gateway**: The `ChatGateway` in the BFF receives the event and delegates to the `AgentService`.
4. **Session loading**: The `AgentService` calls the `SessionService` to load (or create) the session and its conversation history.
5. **System prompt construction**: A system prompt is built containing the agent's role, current date, available tools, and behavioral instructions (e.g., ask for clarification on ambiguous requests).
6. **LLM call with tools**: The `LlmService` sends the full message array (system prompt + history + user message) along with tool definitions to Ollama's OpenAI-compatible API.
7. **Tool execution loop (ReAct)**: If the LLM responds with `tool_calls`, the agent enters a loop:
   - Each tool call is emitted to the frontend as `chat:tool_call` (so the user sees what's happening).
   - The `McpService` executes the tool via stdio transport to the Python MCP server.
   - The tool result is emitted as `chat:tool_result` and appended to the message history.
   - The LLM is called again with the updated history. This repeats up to 5 iterations.
8. **Final response streaming**: When the LLM produces a text response (no tool calls), tokens are streamed to the frontend via `chat:token` events.
9. **Completion**: A `chat:done` event is emitted with the full response content and message ID.
10. **History persistence**: The assistant's response is appended to the session's conversation history for future context.

## Session & Conversation History Management

- Sessions are stored in an **in-memory Map** keyed by `sessionId`.
- A new session is created when a WebSocket connection is established with a new `sessionId`.
- Conversation history is **windowed to the last 20 messages** to stay within the 8B model's ~8K context window. Older messages are dropped from the context (but could be summarized in a production system).
- Each message is stored with its `role` (system, user, assistant, tool), `content`, `timestamp`, and optional tool call metadata (tool name, arguments, result).
- **Production path**: Replace the in-memory Map with Redis (for session storage with TTL-based expiration) and PostgreSQL (for persistent audit trail of all conversations and tool executions).

## Tool Design & Selection Criteria

Tools are defined in the **MCP Server** (Python) following the Model Context Protocol standard. Each tool includes:

- A **clear, descriptive name** (e.g., `getVacationBalance`, `requestTimeOff`) that serves as the API contract with the LLM.
- A **detailed description** that helps the LLM understand when to use the tool.
- A **JSON Schema** for input validation, ensuring the LLM provides correctly typed arguments.

The LLM selects which tools to call based on **natural language understanding** -- there is no hard-coded router or classifier. This makes the system flexible: new tools can be added to the MCP server without changing the agent code.

### The Four Tools

| Tool | Purpose |
|---|---|
| `getVacationBalance` | Check an employee's remaining PTO days |
| `requestTimeOff` | Submit a time-off request (mutates in-memory data) |
| `getCompanyPolicies` | Retrieve HR policies (PTO rules, holidays, etc.) |
| `getTeamCalendar` | Check team availability for a date range |

The **4th tool (`getTeamCalendar`)** was chosen because it adds **organizational context** to individual decisions. Time-off requests don't happen in isolation -- the agent can check whether approving a request would leave a team understaffed, demonstrating systems-level thinking.

## Ambiguity Handling

- The **system prompt** explicitly instructs the agent to ask for clarification instead of guessing when a request is ambiguous (e.g., "I want time off" without specifying dates).
- Examples of ambiguous inputs and expected agent behavior are included in the system prompt as few-shot guidance.
- **Server-side validation** catches malformed tool calls (invalid dates, unknown employee IDs) and returns descriptive error messages that the LLM can use to self-correct.
- The **maximum iteration limit (5)** prevents infinite clarification loops or runaway tool-calling chains.

## Key Tradeoffs

| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| LLM location | Local (Ollama) | Cloud API | Data sovereignty, demonstrates infra ownership |
| Model size | 8B | 70B | Runs on consumer GPU, sufficient for structured tool calling |
| Tool selection | LLM-native | Classifier/router | More flexible, handles novel queries, less code to maintain |
| Session store | In-memory | Redis/PostgreSQL | Demo scope; production would use Redis |
| MCP transport | stdio | SSE/HTTP | Standard MCP pattern, simpler to orchestrate |
| Monorepo | Turborepo | Nx/Lerna | Lighter weight, faster, sufficient for project scope |
| Streaming | WebSocket (socket.io) | SSE | Bidirectional, better for future features (typing indicators, read receipts) |

## Scaling Path (Local to Enterprise)

```
Development          Staging               Production
-----------         -----------           -----------
Ollama (local)  ->  vLLM (single GPU) ->  vLLM + KServe (K8s)
                                          Multi-GPU, autoscaling

stdio MCP       ->  HTTP MCP Server   ->  MCP Gateway (multiple servers)
                                          HR tools, Payroll tools, Compliance tools

In-memory       ->  Redis              ->  Redis Cluster + PostgreSQL
sessions                                  Session TTL, audit trail

npm run dev     ->  Docker Compose     ->  Kubernetes (Helm)
                                          ArgoCD, GitOps

No auth         ->  JWT + RBAC         ->  SSO (SAML/OIDC) + ABAC
                                          Per-agent permissions

No monitoring   ->  Structured logs    ->  OpenTelemetry + Grafana
                                          Token budgets, SLOs
```

## Current Limitations & Risks

1. **Model capability**: The 8B model may struggle with complex multi-step reasoning. Mitigation: clear system prompt, structured tool definitions, server-side validation.
2. **No persistence**: Data resets on restart. Known limitation for demo scope.
3. **No auth**: Employee selection is UI-based. Production requires proper authentication.
4. **Single instance**: No horizontal scaling. The agent loop is stateful per-session in the BFF process.
5. **Tool call reliability**: The LLM may generate malformed tool calls. Mitigation: try/catch around execution, error feedback to LLM for retry.
6. **Context window**: With 8K context and 20-message history, long conversations may lose early context. Production: implement conversation summarization.
