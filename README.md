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

v1.0.0 — Fully functional with 8 routes: Run Setup, Data & DQ, Documents & Rules, Review Gates, BL-EDA Findings, Reports, Status Chat, and Ask Documents.

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

## Companion projects

- [healthx-platform-kb](https://toolit-ai.github.io/healthx-platform-kb/) — Architecture, agent catalog, and operational guides
- [bsmh-agentic-system](https://github.com/SnehashisPattanayak/bsmh-agentic-system) — Python LangGraph execution engine

Maintainer — Snehashis Pattanayak : BSMH Higher Code Initiative
