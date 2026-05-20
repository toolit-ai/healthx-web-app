export interface DQIssue {
  issue_id: string
  run_id: string
  table_name: string
  column_name: string
  check_type: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  description: string
  affected_row_count: number
  status: 'open' | 'waived' | 'resolved'
  waive_notes?: string
  waived_at?: string
}

export interface DQResult {
  run_id: string
  table_name: string
  row_count: number
  issue_count: number
  critical_count: number
  high_count: number
  issues: DQIssue[]
  passed: boolean
  checked_at: string
}

export interface BivariateProfile {
  table_name: string
  measure_correlations: Array<{ col_a: string; col_b: string; assoc_type: string; value: number }>
  vif_scores: Array<{ column: string; vif: number; risk: string }>
  dimension_measure_assoc: Array<{ dimension: string; measure: string; stat: number; p_value: number }>
  dimension_pair_assoc: Array<{ dim_a: string; dim_b: string; cramers_v: number }>
  high_correlation_pairs: number
  profiled_at: string
}

export interface WorkforceContextProfile {
  run_id: string
  tables_analyzed: string[]
  pay_code_concentration: Array<{ code: string; hours: number; pct: number }>
  top_codes_80pct_threshold: number
  temporal_period_stats: Array<{ period: string; total_hours: number; headcount: number }>
  time_grain: string
  segment_health_scores: Array<{ segment: string; dq_score: number }>
  hour_distribution: Array<{ category: string; hours: number; pct: number }>
  detected_payroll_table: string
  detected_value_column: string
  detected_hours_column: string
  detected_pay_code_column: string
  profiled_at: string
}

export interface ExtractedRule {
  rule_id: string
  run_id: string
  document_id: string
  source_chunk_ids: string[]
  primary_chunk_id: string
  rule_text: string
  rule_type: string
  citation_status: string
  citation_text?: string
  applicability?: string
  conditions?: string[]
  exceptions?: string[]
  thresholds?: Record<string, number>
  formulas?: string[]
  governed_data_concepts: string[]
  candidate_tables: string[]
  confidence: number
  testability: 'testable' | 'untestable' | 'partial'
  extraction_warnings: string[]
  requires_human_review: boolean
  extracted_at: string
}

export interface DocumentRecord {
  document_id: string
  filename: string
  status: 'processed' | 'processing' | 'failed'
  document_type: string
  chunk_count: number
  rule_count: number
}

export interface BLEDAFinding {
  finding_id: string
  run_id: string
  pay_practice: string
  check_family: string
  check_name: string
  status: 'open' | 'confirmed' | 'dismissed'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  finding: string
  metric_values: Record<string, number | string>
  affected_count: number
  affected_pct: number
  dollar_impact: number
  hours_impact: number
  dimensions: string[]
  evidence_ref?: string
  source_rule_ids: string[]
  citations: string[]
  recommended_action?: string
  discussion_questions?: string[]
  rule_conflict?: boolean
  rule_conflict_priority?: string
}

export interface InsightCard {
  card_id: string
  run_id: string
  pay_practice: string
  headline: string
  body: string
  finding_ids: string[]
  severity: string
  recommended_action?: string
}

export interface ScenarioResult {
  scenario_id: string
  title: string
  finding: string
  cost_impact: number
  hours_impact: number
  employee_impact: number
  pay_practice: string
}

export interface ReviewGate {
  review_id: string
  run_id: string
  gate_name: string
  status: 'pending' | 'approved' | 'rework_requested' | 'cancelled' | 'not_reached'
  guards: string
  details: string
}

export interface StageProgress {
  stage_id: string
  name: string
  status: 'not_started' | 'running' | 'completed' | 'failed' | 'blocked'
  progress_pct: number
  sub_stages?: StageProgress[]
}

export interface ProgressSnapshot {
  run_id: string
  progress_pct: number
  stages: StageProgress[]
  blocked_by_review: boolean
  review_type: string | null
  snapshot_at: string
}

export interface RunStatus {
  run_id: string
  status: 'not_started' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
  current_stage: string
  current_node: string
  progress_pct: number
  blocked_by_review: boolean
  review_type: string | null
  started_at?: string
  completed_at?: string
}

export interface CorpusStatus {
  run_id: string
  corpus_id: string
  status: 'not_started' | 'indexing' | 'partial' | 'ready' | 'reindexing' | 'failed'
  readiness_pct: number
  indexed_count: number
  total_count: number
  collection_name: string
  failed_documents: string[]
}

export interface DocumentRAGAnswer {
  answer: string
  answerable: boolean
  confidence: 'high' | 'medium' | 'low'
  corpus_id: string
  corpus_readiness_pct: number
  citations: Array<{
    chunk_id: string
    filename: string
    page?: number
    section?: string
    excerpt: string
  }>
  limitations: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  confidence?: string
  citations?: DocumentRAGAnswer['citations']
  limitations?: string[]
  answerable?: boolean
}

export interface ReportInfo {
  report_id: string
  kind: 'deep-dive' | 'executive'
  status: 'not_started' | 'generating' | 'completed' | 'failed'
  qa_status: 'pending' | 'passed' | 'failed'
  section_count: number
  unverified_claim_count: number
  generated_at?: string
}

export interface RunSummary {
  run_id: string
  status: string
  current_stage: string
  progress_pct: number
  created_at: string
}

export interface TableProfile {
  table_name: string
  row_count: number
  column_count: number
  longitudinal: boolean
  periods: number
  column_profiles: Array<{
    column: string
    type: string
    null_rate: number
    unique_count: number
    top_values?: Array<{ value: string; count: number }>
    mean?: number
    std?: number
    min?: number
    max?: number
    skewness?: number
    iqr_outlier_rate?: number
  }>
}

export interface CatalogEntry {
  table_name: string
  column_name: string
  data_type: string
  null_rate: number
  uniqueness: number
  inferred_semantic_type: string
}

export interface RelationshipEntry {
  table_a: string
  column_a: string
  table_b: string
  column_b: string
  relationship_type: string
  confidence: number
}

export interface KeyFactor {
  type: string
  measure: string
  dimension: string
  effect: string
  tier: number
}

export interface KeyVariableGroup {
  group: string
  variables: Array<{ name: string; rank: number; importance: number }>
}
