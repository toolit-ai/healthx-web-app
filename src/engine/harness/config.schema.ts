import { z } from 'zod'

export const HARNESS_DEFAULT_VERSION = '1.0' as const

const RateLimit = z.object({
  tokens_per_minute: z.number().int().positive(),
  requests_per_minute: z.number().int().positive(),
})

const GateConfig = z.object({
  enabled: z.boolean(),
  blocking: z.boolean(),
})

const ArcPhase = z.enum(['plan', 'execute', 'evaluate', 'adapt', 'deploy'])

export const HarnessConfigSchema = z.object({
  version: z.literal(HARNESS_DEFAULT_VERSION),
  arc: z.object({
    phases: z.array(ArcPhase).nonempty(),
    adapt_on_eval_fail: z.boolean(),
    deploy_target: z.enum(['gh-pages', 'snapshot', 'none']),
  }),
  llm: z.object({
    default_provider: z.enum(['anthropic', 'openai']),
    models: z.object({
      extraction: z.string(),
      reasoning: z.string(),
      classification: z.string(),
      narrative: z.string(),
    }),
    pinned_date: z.string(),
    rate_limit: RateLimit,
  }),
  embeddings: z.object({
    provider: z.enum(['voyage', 'openai']),
    model: z.string(),
    static_index: z.string(),
  }),
  parallelism: z.object({
    per_table_eda: z.number().int().positive(),
    per_table_dq: z.number().int().positive(),
    per_document: z.number().int().positive(),
    per_rule_batch: z.number().int().positive(),
    rule_batch_size: z.number().int().positive(),
  }),
  gates: z.object({
    semantic_mapping_review: GateConfig,
    dq_gate_review: GateConfig,
    bl_eda_synthesis: GateConfig,
    report_qa_review: GateConfig,
  }),
  io: z.object({
    picker: z.enum(['fs-access', 'drag-drop', 'demo-only']),
    demo_mode: z.boolean(),
    supported_formats: z.array(z.string()).nonempty(),
  }),
  reporting: z.object({
    formats: z.array(z.enum(['html'])).nonempty(),
    unverified_claims: z.enum(['appendix', 'drop']),
    generate_executive_after: z.string(),
  }),
  observability: z.object({
    log_level: z.enum(['debug', 'info', 'warn', 'error']),
    emit_events: z.boolean(),
    redact_hipaa_adjacent: z.boolean(),
  }),
  nodes: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
})

export type HarnessConfig = z.infer<typeof HarnessConfigSchema>
export type ArcPhaseName = z.infer<typeof ArcPhase>
