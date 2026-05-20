// Pinned model IDs — keep in sync with CLAUDE.md §"LLM model versions (pinned)"
// and with healthx-platform-kb/content/architecture/03-tech-stack.mdx.
export const DEFAULT_MODELS = {
  extraction: 'claude-sonnet-4-6',
  reasoning: 'claude-opus-4-6',
  classification: 'claude-haiku-4-5-20251001',
  narrative: 'claude-sonnet-4-6',
} as const

export const MODEL_PINNED_DATE = '2026-05-16'

export const PROVIDER_MODEL_MAP = {
  anthropic: DEFAULT_MODELS,
  openai: {
    extraction: 'gpt-4o-2024-11-20',
    reasoning: 'o1-2024-12-17',
    classification: 'gpt-4o-mini-2024-07-18',
    narrative: 'gpt-4o-2024-11-20',
  },
} as const

export type ProviderName = keyof typeof PROVIDER_MODEL_MAP
