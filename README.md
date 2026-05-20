# healthx-web-app

HealthX — browser-native AAA (Autonomous Agentic Arc) for healthcare workforce and pay-practice analytics.

A complete TypeScript rewrite of the Python BSMH Agentic System, running entirely in the browser:

- **Mastra**-driven agent topology (33 agents, 5 workflows) — pure client-side execution
- **AAA harness** — one YAML controls model pins, parallelism, gates, deploy targets
- **Cached static vector index** for the Ask Documents RAG
- **BYO LLM key** (Anthropic / OpenAI) stored locally in IndexedDB
- **File System Access API** folder picker for run inputs
- **OPFS + IndexedDB + DuckDB-WASM** for state, artifacts, and tabular analytics
- Deployed via GitHub Actions to GitHub Pages

## Status

Phase 0 — bootstrap. See [`docs/architecture` on the KB repo](https://toolit-ai.github.io/healthx-platform-kb/) for the full plan and phased roadmap.

## Local development

```bash
corepack enable && corepack prepare pnpm@9.15.0 --activate
pnpm install
pnpm dev          # http://localhost:5173
pnpm typecheck
pnpm build        # → dist/
pnpm preview      # serve the built bundle
```

## Deploy

Push to `main` → GitHub Actions builds and publishes to `https://toolit-ai.github.io/healthx-web-app/`.
