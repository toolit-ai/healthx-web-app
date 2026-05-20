import { describe, it, expect } from 'vitest'
import { HARNESS_DEFAULT_VERSION, HarnessConfigSchema, type HarnessConfig } from '@/engine/harness/config.schema'

const validConfig: HarnessConfig = {
  version: '1.0',
  arc: {
    phases: ['plan', 'execute', 'evaluate', 'adapt', 'deploy'],
    adapt_on_eval_fail: true,
    deploy_target: 'gh-pages',
  },
  llm: {
    default_provider: 'anthropic',
    models: {
      extraction: 'claude-sonnet-4-6',
      reasoning: 'claude-opus-4-6',
      classification: 'claude-haiku-4-5-20251001',
      narrative: 'claude-sonnet-4-6',
    },
    pinned_date: '2026-05-16',
    rate_limit: { tokens_per_minute: 80000, requests_per_minute: 50 },
  },
  embeddings: {
    provider: 'voyage',
    model: 'voyage-3',
    static_index: '/assets/vectors/index.json',
  },
  parallelism: {
    per_table_eda: 4,
    per_table_dq: 4,
    per_document: 3,
    per_rule_batch: 2,
    rule_batch_size: 20,
  },
  gates: {
    semantic_mapping_review: { enabled: true, blocking: true },
    dq_gate_review: { enabled: true, blocking: true },
    bl_eda_synthesis: { enabled: true, blocking: true },
    report_qa_review: { enabled: true, blocking: false },
  },
  io: {
    picker: 'fs-access',
    demo_mode: false,
    supported_formats: ['csv', 'xlsx', 'pdf', 'docx', 'md', 'txt'],
  },
  reporting: {
    formats: ['html'],
    unverified_claims: 'appendix',
    generate_executive_after: 'deep-dive',
  },
  observability: {
    log_level: 'info',
    emit_events: true,
    redact_hipaa_adjacent: true,
  },
}

describe('HarnessConfigSchema', () => {
  it('exposes the pinned version constant', () => {
    expect(HARNESS_DEFAULT_VERSION).toBe('1.0')
  })

  it('accepts the canonical default config', () => {
    const parsed = HarnessConfigSchema.parse(validConfig)
    expect(parsed.arc.phases).toEqual(['plan', 'execute', 'evaluate', 'adapt', 'deploy'])
    expect(parsed.llm.models.extraction).toBe('claude-sonnet-4-6')
  })

  it('rejects an unknown arc phase', () => {
    const bad = { ...validConfig, arc: { ...validConfig.arc, phases: ['plan', 'wat'] } }
    expect(() => HarnessConfigSchema.parse(bad)).toThrow()
  })

  it('rejects an empty supported_formats list', () => {
    const bad = { ...validConfig, io: { ...validConfig.io, supported_formats: [] } }
    expect(() => HarnessConfigSchema.parse(bad)).toThrow()
  })
})
