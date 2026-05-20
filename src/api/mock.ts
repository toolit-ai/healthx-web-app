import type {
  DQIssue,
  BivariateProfile,
  WorkforceContextProfile,
  ExtractedRule,
  DocumentRecord,
  BLEDAFinding,
  InsightCard,
  ScenarioResult,
  ReviewGate,
  ProgressSnapshot,
  RunStatus,
  CorpusStatus,
  DocumentRAGAnswer,
  ReportInfo,
  RunSummary,
  TableProfile,
  CatalogEntry,
  RelationshipEntry,
} from '@/types/api'

export const PIPELINE_STAGES = [
  { id: 'setup', label: 'Run Setup', icon: '01', note: 'Inputs & sources' },
  { id: 'data', label: 'Data & DQ', icon: '02', note: 'Profile + quality' },
  { id: 'docs', label: 'Documents & Rules', icon: '03', note: 'Extract business logic' },
  { id: 'gates', label: 'Review Gates', icon: '04', note: 'Human-in-the-loop' },
  { id: 'findings', label: 'BL-EDA Findings', icon: '05', note: 'By severity' },
  { id: 'ask', label: 'Ask Documents', icon: '06', note: 'Document RAG' },
  { id: 'reports', label: 'Reports', icon: '07', note: 'Deep-dive + Exec' },
  { id: 'status', label: 'Status Chat', icon: '08', note: 'Run telemetry' },
]

export const RUN_PROGRESS = [
  { id: 'initialize', label: 'Initialize run', status: 'completed', at: '10:02:14' },
  { id: 'intake', label: 'Intake & catalog', status: 'completed', at: '10:02:48' },
  { id: 'eda', label: 'EDA profiling (5 tables)', status: 'completed', at: '10:09:22' },
  { id: 'dq', label: 'DQ validation', status: 'completed', at: '10:11:05' },
  { id: 'rels', label: 'Relationship validation', status: 'completed', at: '10:13:40' },
  { id: 'workforce', label: 'Workforce context', status: 'completed', at: '10:15:12' },
  { id: 'doc-ingest', label: 'Document ingestion (14 docs)', status: 'completed', at: '10:18:55' },
  { id: 'doc-llm', label: 'Rule extraction (LLM)', status: 'completed', at: '10:31:09' },
  { id: 'doc-gate', label: 'Document quality gate', status: 'completed', at: '10:31:28' },
  { id: 'rag', label: 'Document RAG index', status: 'completed', at: '10:33:02' },
  { id: 'mapping', label: 'Semantic mapping', status: 'completed', at: '10:36:48' },
  { id: 'normalize', label: 'Rule normalization', status: 'completed', at: '10:39:14' },
  { id: 'testability', label: 'Testability classification', status: 'completed', at: '10:39:55' },
  { id: 'plan', label: 'Validation planning', status: 'completed', at: '10:40:30' },
  { id: 'bl-gate', label: 'BL Mapping Review Gate', status: 'completed', at: '11:04:22', review: true },
  { id: 'dq-gate', label: 'DQ Gate', status: 'completed', at: '11:05:01', review: true },
  { id: 'bl-eda', label: 'BL-EDA execution', status: 'running', at: '—', sub: true },
  { id: 'evidence', label: 'Evidence aggregation', status: 'not_started', at: '—' },
  { id: 'persist', label: 'Persistence', status: 'not_started', at: '—' },
  { id: 'report-dd', label: 'Deep-dive report', status: 'not_started', at: '—' },
  { id: 'report-ex', label: 'Executive report', status: 'not_started', at: '—' },
]

export const PAY_PRACTICES = [
  'Overtime', 'Consecutive Days', 'Punch Exceptions', 'Incidental Overtime',
  'Float & Agency', 'On Call & Callback', 'Break Exceptions', 'Critical Staffing',
  'Weekend Option', 'Premium Labor', 'Holiday Pay', 'Shift Differentials & Stacking',
  'Role-Based Premiums', 'Preceptor Pay', 'Charge Nurse Pay', 'Mandatory Training',
  'Schedule Effectiveness', 'CBA Alignment',
]

export const BL_EDA_RUNNING = [
  { name: 'Overtime', status: 'completed', findings: 14 },
  { name: 'Consecutive Days', status: 'completed', findings: 6 },
  { name: 'Shift Differentials & Stacking', status: 'completed', findings: 11 },
  { name: 'Weekend Option', status: 'running', findings: 4 },
  { name: 'On Call & Callback', status: 'running', findings: 3 },
  { name: 'Critical Staffing', status: 'not_started', findings: 0 },
  { name: 'Premium Labor', status: 'not_started', findings: 0 },
  { name: 'Holiday Pay', status: 'not_started', findings: 0 },
  { name: 'Break Exceptions', status: 'not_started', findings: 0 },
  { name: 'CBA Alignment', status: 'not_started', findings: 0 },
]

export const FINDINGS = [
  {
    id: 'F-0142',
    severity: 'critical',
    practice: 'Overtime',
    title: 'VTO/VTU/MTO/MTU counted as worked hours toward OT threshold at St. Vincent',
    affected: 1428,
    hours: '21,440',
    dollars: '$1.42M',
    rules: ['R-0017', 'R-0023'],
    discussion: 'Confirm whether intent is to align with central policy or to ratify the facility-local exception.',
  },
  {
    id: 'F-0118',
    severity: 'critical',
    practice: 'Shift Differentials & Stacking',
    title: 'SD3 Night + WDF Weekend stacking exceeds CBA cap in 312 weeks (Toledo CBA §4.7)',
    affected: 612,
    hours: '8,910',
    dollars: '$612K',
    rules: ['R-0044'],
    discussion: 'Cap interpretation differs across markets — recommend single normalized cap.',
  },
  {
    id: 'F-0096',
    severity: 'high',
    practice: 'On Call & Callback',
    title: 'ROC vs non-ROC callback minimum differs by 1.5 hours with no policy basis',
    affected: 384,
    hours: '4,212',
    dollars: '$305K',
    rules: ['R-0061', 'R-0063'],
    discussion: 'Two ROC markets use 4-hour minimum, non-ROC uses 2.5-hour minimum. Document this delta.',
  },
  {
    id: 'F-0081',
    severity: 'high',
    practice: 'Consecutive Days',
    title: '7+ consecutive day premium not consistently applied across allied health roles',
    affected: 219,
    hours: '1,876',
    dollars: '$178K',
    rules: ['R-0029'],
    discussion: 'Premium triggered for nursing but skipped for AH in two facilities.',
  },
  {
    id: 'F-0073',
    severity: 'high',
    practice: 'Weekend Option',
    title: 'WEO eligibility window varies — 4-week vs 8-week qualification across markets',
    affected: 158,
    hours: '—',
    dollars: '—',
    rules: ['R-0052'],
    discussion: 'Driven by 3 different CBAs; not all variation is contractually required.',
  },
  {
    id: 'F-0061',
    severity: 'medium',
    practice: 'Premium Labor',
    title: 'Premium labor codes increased 31% YoY in Q2 — staffing gap correlation strong',
    affected: 940,
    hours: '12,602',
    dollars: '$821K',
    rules: ['R-0072', 'R-0074'],
    discussion: 'Trend signal — escalate to Operations for staffing-plan review.',
  },
  {
    id: 'F-0048',
    severity: 'medium',
    practice: 'Break Exceptions',
    title: 'Missed-break premium auto-paid without manager attestation in 22% of shifts',
    affected: 612,
    hours: '—',
    dollars: '$94K',
    rules: ['R-0083'],
    discussion: 'Process control gap — recommend attestation prompt in UKG.',
  },
  {
    id: 'F-0031',
    severity: 'low',
    practice: 'Preceptor Pay',
    title: 'Preceptor pay code applied past credential expiration date in 18 cases',
    affected: 18,
    hours: '—',
    dollars: '$3.2K',
    rules: ['R-0091'],
    discussion: 'Low impact but easy fix — flag in payroll review.',
  },
]

export const DOCUMENTS = [
  { name: 'Toledo_CBA_2024-2027.pdf', status: 'extracted', chunks: 412, rules: 41 },
  { name: 'Lorain_CBA_2023-2026.pdf', status: 'extracted', chunks: 388, rules: 36 },
  { name: 'Springfield_CBA_2024-2027.pdf', status: 'extracted', chunks: 401, rules: 39 },
  { name: 'Youngstown_CBA_2022-2025.pdf', status: 'extracted', chunks: 376, rules: 34 },
  { name: 'Warren_CBA_2023-2026.pdf', status: 'extracted', chunks: 354, rules: 31 },
  { name: 'Cincinnati_CBA_2024-2027.pdf', status: 'extracted', chunks: 422, rules: 44 },
  { name: 'Greenville_CBA_2023-2026.pdf', status: 'extracted', chunks: 339, rules: 28 },
  { name: 'Richmond_CBA_2024-2027.pdf', status: 'extracted', chunks: 380, rules: 33 },
  { name: 'Lima_CBA_2022-2025.pdf', status: 'ocr_used', chunks: 311, rules: 26 },
  { name: 'Central_Pay_Policy_2024.pdf', status: 'extracted', chunks: 198, rules: 52 },
  { name: 'Critical_Staffing_Memo_Q1.docx', status: 'extracted', chunks: 22, rules: 7 },
  { name: 'ROC_Callback_Practices.pdf', status: 'extracted', chunks: 64, rules: 14 },
  { name: 'Holiday_Pay_Addendum_2024.pdf', status: 'extracted', chunks: 41, rules: 11 },
  { name: 'Preceptor_Pay_Guidelines.md', status: 'extracted', chunks: 18, rules: 5 },
]

export const RULES_FOR_DOC = [
  {
    id: 'R-0017',
    text: 'Employees who use VTO, VTU, MTO, or MTU shall have those hours counted toward the 40-hour overtime threshold for the workweek.',
    type: 'Threshold',
    practice: 'Overtime',
    citation: 'verified',
    confidence: 'high',
    concepts: ['worked_hours', 'ot_threshold', 'absence_codes'],
    tables: ['timesheet_v3', 'absence_codes_lkp'],
  },
  {
    id: 'R-0023',
    text: 'Overtime premium of 1.5x base rate applies to hours in excess of forty (40) in a workweek.',
    type: 'Rate',
    practice: 'Overtime',
    citation: 'verified',
    confidence: 'high',
    concepts: ['ot_premium_rate', 'workweek'],
    tables: ['payroll_v3', 'rate_table'],
  },
  {
    id: 'R-0029',
    text: 'Employees working seven (7) or more consecutive scheduled days shall receive premium pay at 1.5x base rate for all hours worked on the seventh and subsequent days.',
    type: 'Threshold + Rate',
    practice: 'Consecutive Days',
    citation: 'flagged',
    confidence: 'medium',
    concepts: ['consecutive_days', 'scheduled_days', 'premium_rate'],
    tables: ['schedule_v2', 'timesheet_v3'],
  },
  {
    id: 'R-0044',
    text: 'Shift differential premiums (SD1, SD2, SD3) and weekend differential (WDF) may not stack to exceed 35% of base rate in any pay period.',
    type: 'Cap',
    practice: 'Shift Differentials & Stacking',
    citation: 'verified',
    confidence: 'high',
    concepts: ['shift_diff', 'weekend_diff', 'stacking_cap'],
    tables: ['payroll_v3', 'rate_table'],
  },
]

export const RAG_TRANSCRIPT = [
  {
    role: 'user',
    text: 'What does the Toledo CBA say about consecutive day premiums?',
  },
  {
    role: 'assistant',
    text: 'Per Toledo CBA §4.3, employees who work seven (7) or more consecutive scheduled days are entitled to 1.5× base rate for all hours on the 7th and subsequent days. The premium continues until the employee has a non-scheduled day. CBA language does not exclude allied-health roles, though the Springfield and Warren CBAs do.',
    confidence: 'high',
    citations: [
      { doc: 'Toledo_CBA_2024-2027.pdf', section: '§4.3 Consecutive Day Premium', page: 27 },
      { doc: 'Springfield_CBA_2024-2027.pdf', section: '§4.3 (variation)', page: 24 },
      { doc: 'Warren_CBA_2023-2026.pdf', section: '§4.4 (variation)', page: 22 },
    ],
    limitations: 'Answer is grounded in 3 of 11 CBAs. Other markets may have additional variations not surfaced here.',
  },
  {
    role: 'user',
    text: 'Are VTO hours counted toward the OT threshold anywhere?',
  },
  {
    role: 'assistant',
    text: 'Yes — the St. Vincent facility memo (dated 2023-03-14, included in the Central Pay Policy addendum) explicitly counts VTO, VTU, MTO, and MTU hours toward the 40-hour workweek threshold for overtime. No other facility memo in the corpus contains equivalent language; central policy excludes these codes from worked hours.',
    confidence: 'high',
    citations: [
      { doc: 'Central_Pay_Policy_2024.pdf', section: 'Appendix C — Facility Exceptions', page: 88 },
      { doc: 'Holiday_Pay_Addendum_2024.pdf', section: '§2.1 Worked Hours Definition', page: 4 },
    ],
    limitations: null,
  },
]

export const DQ_ISSUES = [
  { sev: 'critical', table: 'timesheet_v3', column: 'punch_out_ts', check: 'null_rate', desc: 'Null rate 2.4% exceeds 0.5% threshold', status: 'waived' },
  { sev: 'critical', table: 'payroll_v3', column: 'pay_code', check: 'domain_check', desc: '12 unmapped pay codes encountered', status: 'resolved' },
  { sev: 'high', table: 'schedule_v2', column: 'shift_start', check: 'fk_integrity', desc: '0.8% rows missing employee FK', status: 'resolved' },
  { sev: 'medium', table: 'employee_v2', column: 'hire_date', check: 'future_date', desc: '3 rows with hire_date in future', status: 'open' },
  { sev: 'low', table: 'timesheet_v3', column: 'facility_id', check: 'cardinality', desc: 'Cardinality higher than catalog (29 vs 27)', status: 'open' },
]

// API functions — adapted to return design-handover data where possible,
// falling back to legacy shapes for types compatibility

export function getRecentRuns(): RunSummary[] {
  return [
    { run_id: 'run-2026-05-20-a7f3', status: 'running', current_stage: 'BL-EDA Synthesis', progress_pct: 62, created_at: '2026-05-20T04:00:00Z' },
    { run_id: 'run-2026-05-19-b2c1', status: 'completed', current_stage: 'Complete', progress_pct: 100, created_at: '2026-05-19T10:30:00Z' },
    { run_id: 'run-2026-05-18-d9e4', status: 'paused', current_stage: 'BL Mapping Review Gate', progress_pct: 45, created_at: '2026-05-18T14:15:00Z' },
  ]
}

export function getRunStatus(): RunStatus {
  return {
    run_id: 'run-2026-05-20-a7f3',
    status: 'running',
    current_stage: 'BL-EDA Synthesis',
    current_node: 'bl_eda_subgraph',
    progress_pct: 62,
    blocked_by_review: false,
    review_type: null,
    started_at: '2026-05-20T04:00:00Z',
  }
}

export function getProgressSnapshot(): ProgressSnapshot {
  return {
    run_id: 'run-2026-05-20-a7f3',
    progress_pct: 62,
    blocked_by_review: false,
    review_type: null,
    snapshot_at: new Date().toISOString(),
    stages: [
      { stage_id: 's1', name: 'Initialize run', status: 'completed', progress_pct: 100 },
      { stage_id: 's2', name: 'Intake & catalog', status: 'completed', progress_pct: 100 },
      { stage_id: 's3', name: 'EDA profiling (5 tables)', status: 'completed', progress_pct: 100 },
      { stage_id: 's4', name: 'DQ validation', status: 'completed', progress_pct: 100 },
      { stage_id: 's5', name: 'Relationship validation', status: 'completed', progress_pct: 100 },
      { stage_id: 's6', name: 'Workforce context', status: 'completed', progress_pct: 100 },
      { stage_id: 's7', name: 'Document ingestion (14 docs)', status: 'completed', progress_pct: 100 },
      { stage_id: 's8', name: 'Rule extraction (LLM)', status: 'completed', progress_pct: 100 },
      { stage_id: 's9', name: 'Document quality gate', status: 'completed', progress_pct: 100 },
      { stage_id: 's10', name: 'Document RAG index', status: 'completed', progress_pct: 100 },
      { stage_id: 's11', name: 'Semantic mapping', status: 'completed', progress_pct: 100 },
      { stage_id: 's12', name: 'Rule normalization', status: 'completed', progress_pct: 100 },
      { stage_id: 's13', name: 'Testability classification', status: 'completed', progress_pct: 100 },
      { stage_id: 's14', name: 'Validation planning', status: 'completed', progress_pct: 100 },
      { stage_id: 's15', name: 'BL Mapping Review Gate', status: 'completed', progress_pct: 100 },
      { stage_id: 's16', name: 'DQ Gate', status: 'completed', progress_pct: 100 },
      { stage_id: 's17', name: 'BL-EDA execution', status: 'running', progress_pct: 50 },
      { stage_id: 's18', name: 'Evidence aggregation', status: 'not_started', progress_pct: 0 },
      { stage_id: 's19', name: 'Persistence', status: 'not_started', progress_pct: 0 },
      { stage_id: 's20', name: 'Deep-dive report', status: 'not_started', progress_pct: 0 },
      { stage_id: 's21', name: 'Executive report', status: 'not_started', progress_pct: 0 },
    ],
  }
}

export function getDQIssues(): DQIssue[] {
  return [
    { issue_id: 'dq-001', run_id: 'run-2026-05-20-a7f3', table_name: 'timesheet_v3', column_name: 'punch_out_ts', check_type: 'null_rate', severity: 'critical', description: 'Null rate 2.4% exceeds 0.5% threshold', affected_row_count: 1842, status: 'waived', waive_notes: 'Known data quality issue from source system — waived per DQA agreement', waived_at: '2026-05-20T05:12:00Z' },
    { issue_id: 'dq-002', run_id: 'run-2026-05-20-a7f3', table_name: 'payroll_v3', column_name: 'pay_code', check_type: 'domain_check', severity: 'critical', description: '12 unmapped pay codes encountered', affected_row_count: 347, status: 'resolved' },
    { issue_id: 'dq-003', run_id: 'run-2026-05-20-a7f3', table_name: 'schedule_v2', column_name: 'shift_start', check_type: 'fk_integrity', severity: 'high', description: '0.8% rows missing employee FK', affected_row_count: 892, status: 'resolved' },
    { issue_id: 'dq-004', run_id: 'run-2026-05-20-a7f3', table_name: 'employee_v2', column_name: 'hire_date', check_type: 'future_date', severity: 'medium', description: '3 rows with hire_date in future', affected_row_count: 3, status: 'open' },
    { issue_id: 'dq-005', run_id: 'run-2026-05-20-a7f3', table_name: 'timesheet_v3', column_name: 'facility_id', check_type: 'cardinality', severity: 'low', description: 'Cardinality higher than catalog (29 vs 27)', affected_row_count: 0, status: 'open' },
  ]
}

export function getDQStatus(): { gate_passed: boolean; critical_count: number; high_count: number; medium_count: number; waived_count: number } {
  return { gate_passed: true, critical_count: 0, high_count: 0, medium_count: 1, waived_count: 1 }
}

export function getTableProfiles(): TableProfile[] {
  return [
    { table_name: 'timesheet_v3', row_count: 8400000, column_count: 47, longitudinal: true, periods: 12, column_profiles: [
      { column: 'id', type: 'string', null_rate: 0, unique_count: 8400000 },
      { column: 'employee_id', type: 'string', null_rate: 0, unique_count: 42000 },
      { column: 'punch_ts', type: 'datetime', null_rate: 0.007, unique_count: 8100000 },
      { column: 'hours_worked', type: 'numeric', null_rate: 0.003, unique_count: 120, mean: 7.8, std: 2.1 },
      { column: 'pay_code', type: 'string', null_rate: 0, unique_count: 23 },
      { column: 'facility_id', type: 'string', null_rate: 0, unique_count: 29 },
    ]},
    { table_name: 'schedule_v2', row_count: 1900000, column_count: 22, longitudinal: true, periods: 12, column_profiles: [
      { column: 'id', type: 'string', null_rate: 0, unique_count: 1900000 },
      { column: 'employee_id', type: 'string', null_rate: 0.008, unique_count: 41000 },
      { column: 'shift_start', type: 'datetime', null_rate: 0.002, unique_count: 1800000 },
      { column: 'scheduled_hours', type: 'numeric', null_rate: 0.001, unique_count: 45, mean: 8.0, std: 1.8 },
    ]},
    { table_name: 'payroll_v3', row_count: 920000, column_count: 38, longitudinal: true, periods: 12, column_profiles: [
      { column: 'id', type: 'string', null_rate: 0, unique_count: 920000 },
      { column: 'employee_id', type: 'string', null_rate: 0, unique_count: 42000 },
      { column: 'pay_amount', type: 'numeric', null_rate: 0.002, unique_count: 89000, mean: 1840.5, std: 420.3 },
      { column: 'pay_code', type: 'string', null_rate: 0.012, unique_count: 35 },
    ]},
    { table_name: 'employee_v2', row_count: 42000, column_count: 28, longitudinal: false, periods: 1, column_profiles: [
      { column: 'employee_id', type: 'string', null_rate: 0, unique_count: 42000 },
      { column: 'hire_date', type: 'date', null_rate: 0.001, unique_count: 3800 },
      { column: 'role_family', type: 'string', null_rate: 0.003, unique_count: 12 },
      { column: 'facility_id', type: 'string', null_rate: 0.002, unique_count: 9 },
    ]},
    { table_name: 'absence_codes_lkp', row_count: 184, column_count: 6, longitudinal: false, periods: 1, column_profiles: [
      { column: 'code', type: 'string', null_rate: 0, unique_count: 184 },
      { column: 'description', type: 'string', null_rate: 0, unique_count: 184 },
      { column: 'category', type: 'string', null_rate: 0, unique_count: 8 },
    ]},
  ]
}

export function getBivariateProfiles(): BivariateProfile[] {
  return [
    {
      table_name: 'payroll',
      measure_correlations: [
        { col_a: 'hours_worked', col_b: 'scheduled_hours', assoc_type: 'pearson', value: 0.94 },
        { col_a: 'hours_worked', col_b: 'ot_hrs', assoc_type: 'pearson', value: 0.71 },
        { col_a: 'scheduled_hours', col_b: 'ot_hrs', assoc_type: 'pearson', value: 0.42 },
        { col_a: 'base_rate', col_b: 'tenure', assoc_type: 'pearson', value: 0.65 },
      ],
      vif_scores: [
        { column: 'hours_worked', vif: 14.2, risk: 'high' },
        { column: 'scheduled_hours', vif: 11.8, risk: 'high' },
        { column: 'base_rate', vif: 5.6, risk: 'medium' },
        { column: 'years_service', vif: 3.1, risk: 'low' },
        { column: 'facility_id', vif: 1.4, risk: 'low' },
      ],
      dimension_measure_assoc: [
        { dimension: 'facility_id', measure: 'hours_worked', stat: 48.2, p_value: 0.001 },
      ],
      dimension_pair_assoc: [
        { dim_a: 'pay_code', dim_b: 'facility_id', cramers_v: 0.34 },
      ],
      high_correlation_pairs: 2,
      profiled_at: '2026-05-20T04:30:00Z',
    },
  ]
}

export function getWorkforceContext(): WorkforceContextProfile {
  return {
    run_id: 'run-2026-05-20-a7f3',
    tables_analyzed: ['timesheet_v3', 'schedule_v2', 'payroll_v3', 'employee_v2', 'absence_codes_lkp'],
    pay_code_concentration: [
      { code: 'REG', hours: 10432000, pct: 62.0 },
      { code: 'OT15', hours: 2352000, pct: 14.0 },
      { code: 'SD3', hours: 1344000, pct: 8.0 },
      { code: 'WDF', hours: 840000, pct: 5.0 },
      { code: 'VTO', hours: 672000, pct: 4.0 },
      { code: 'MTO', hours: 504000, pct: 3.0 },
      { code: 'CALL', hours: 336000, pct: 2.0 },
      { code: 'PREM', hours: 336000, pct: 2.0 },
    ],
    top_codes_80pct_threshold: 3,
    temporal_period_stats: [
      { period: '2025-03', total_hours: 12450000, headcount: 11800 },
      { period: '2025-04', total_hours: 11980000, headcount: 11920 },
      { period: '2025-05', total_hours: 12100000, headcount: 12010 },
      { period: '2025-06', total_hours: 12340000, headcount: 11950 },
      { period: '2025-07', total_hours: 12560000, headcount: 12100 },
      { period: '2025-08', total_hours: 11890000, headcount: 12050 },
    ],
    time_grain: 'monthly',
    segment_health_scores: [
      { segment: 'St. Vincent Toledo', dq_score: 0.81 },
      { segment: 'Mercy Lorain', dq_score: 0.87 },
      { segment: 'Allied Health · Imaging', dq_score: 0.88 },
      { segment: 'Mercy Springfield', dq_score: 0.93 },
      { segment: 'Nursing · Critical Care', dq_score: 0.96 },
    ],
    hour_distribution: [
      { category: 'Regular', hours: 10432000, pct: 62.0 },
      { category: 'Overtime', hours: 2352000, pct: 14.0 },
      { category: 'Premium', hours: 4032000, pct: 24.0 },
    ],
    detected_payroll_table: 'payroll_v3',
    detected_value_column: 'pay_amount',
    detected_hours_column: 'hours_worked',
    detected_pay_code_column: 'pay_code',
    profiled_at: '2026-05-20T04:35:00Z',
  }
}

export function getRelationships(): RelationshipEntry[] {
  return [
    { table_a: 'timesheet_v3', column_a: 'employee_id', table_b: 'employee_v2', column_b: 'employee_id', relationship_type: 'foreign_key', confidence: 0.992 },
    { table_a: 'timesheet_v3', column_a: 'pay_code', table_b: 'absence_codes_lkp', column_b: 'code', relationship_type: 'domain_check', confidence: 0.998 },
    { table_a: 'schedule_v2', column_a: 'employee_id', table_b: 'employee_v2', column_b: 'employee_id', relationship_type: 'foreign_key', confidence: 1.0 },
    { table_a: 'payroll_v3', column_a: 'timesheet_id', table_b: 'timesheet_v3', column_b: 'id', relationship_type: 'foreign_key', confidence: 0.999 },
  ]
}

export function getCatalog(): CatalogEntry[] {
  return [
    { table_name: 'timesheet_v3', column_name: 'id', data_type: 'bigint', null_rate: 0, uniqueness: 1, inferred_semantic_type: 'entity_key' },
    { table_name: 'timesheet_v3', column_name: 'employee_id', data_type: 'varchar(32)', null_rate: 0, uniqueness: 0.005, inferred_semantic_type: 'entity_key' },
    { table_name: 'timesheet_v3', column_name: 'punch_ts', data_type: 'timestamp', null_rate: 0.007, uniqueness: 0.964, inferred_semantic_type: 'timestamp' },
    { table_name: 'timesheet_v3', column_name: 'hours_worked', data_type: 'decimal(6,2)', null_rate: 0.003, uniqueness: 0.000014, inferred_semantic_type: 'duration_hours' },
    { table_name: 'timesheet_v3', column_name: 'pay_code', data_type: 'varchar(16)', null_rate: 0, uniqueness: 0.0000027, inferred_semantic_type: 'categorical' },
    { table_name: 'schedule_v2', column_name: 'id', data_type: 'bigint', null_rate: 0, uniqueness: 1, inferred_semantic_type: 'entity_key' },
    { table_name: 'schedule_v2', column_name: 'employee_id', data_type: 'varchar(32)', null_rate: 0.008, uniqueness: 0.021, inferred_semantic_type: 'entity_key' },
    { table_name: 'schedule_v2', column_name: 'shift_start', data_type: 'timestamp', null_rate: 0.002, uniqueness: 0.947, inferred_semantic_type: 'timestamp' },
    { table_name: 'payroll_v3', column_name: 'id', data_type: 'bigint', null_rate: 0, uniqueness: 1, inferred_semantic_type: 'entity_key' },
    { table_name: 'payroll_v3', column_name: 'pay_amount', data_type: 'decimal(12,2)', null_rate: 0.002, uniqueness: 0.097, inferred_semantic_type: 'monetary_amount' },
    { table_name: 'employee_v2', column_name: 'employee_id', data_type: 'varchar(32)', null_rate: 0, uniqueness: 1, inferred_semantic_type: 'entity_key' },
    { table_name: 'employee_v2', column_name: 'hire_date', data_type: 'date', null_rate: 0.001, uniqueness: 0.09, inferred_semantic_type: 'date' },
    { table_name: 'absence_codes_lkp', column_name: 'code', data_type: 'varchar(16)', null_rate: 0, uniqueness: 1, inferred_semantic_type: 'entity_key' },
  ]
}

export function getDocuments(): DocumentRecord[] {
  return DOCUMENTS.map((d, i) => ({
    document_id: `doc-${String(i + 1).padStart(3, '0')}`,
    filename: d.name,
    status: d.status as 'processed' | 'processing' | 'failed',
    document_type: d.name.includes('CBA') ? 'CBA' : d.name.includes('Policy') ? 'Policy' : 'Addendum',
    chunk_count: d.chunks,
    rule_count: d.rules,
  }))
}

export function getRulesForDocument(_docId: string): ExtractedRule[] {
  // Return all rules for demo; in real app would filter by doc
  return RULES_FOR_DOC.map((r) => ({
    rule_id: r.id,
    run_id: 'run-2026-05-20-a7f3',
    document_id: 'doc-001',
    source_chunk_ids: ['c-1'],
    primary_chunk_id: 'c-1',
    rule_text: r.text,
    rule_type: r.type,
    citation_status: r.citation,
    citation_text: 'CBA Article VII, Section 3(a)',
    governed_data_concepts: r.concepts,
    candidate_tables: r.tables,
    confidence: r.confidence === 'high' ? 0.97 : 0.72,
    testability: 'testable' as const,
    extraction_warnings: [],
    requires_human_review: r.confidence === 'medium',
    extracted_at: '2026-05-20T04:10:00Z',
  }))
}

export function getReviewGates(): ReviewGate[] {
  return [
    {
      review_id: 'rg-001',
      run_id: 'run-2026-05-20-a7f3',
      gate_name: 'BL Mapping Review Gate',
      status: 'approved',
      guards: 'Guards BL-EDA execution. 3 rules were flagged with medium-confidence mappings. The gate review verified semantic mapping and rule normalization before tests run.',
      details: 'Approved · 3 mappings corrected (R-0029 → consecutive_days concept, R-0044 cap normalized to weekly).',
    },
    {
      review_id: 'rg-002',
      run_id: 'run-2026-05-20-a7f3',
      gate_name: 'Report QA Review Gate',
      status: 'not_reached',
      guards: 'Guards executive-ready report status. Held until BL-EDA persistence completes and deep-dive report renders without QA failures.',
      details: 'Gate not yet reached. Reports will be generated after BL-EDA completion.',
    },
  ]
}

export function getFindings(): BLEDAFinding[] {
  return FINDINGS.map((f) => ({
    finding_id: f.id,
    run_id: 'run-2026-05-20-a7f3',
    pay_practice: f.practice,
    check_family: 'threshold_verification',
    check_name: 'BL_EDA_Check',
    status: 'open',
    severity: f.severity as 'critical' | 'high' | 'medium' | 'low' | 'info',
    title: f.title,
    finding: f.discussion,
    metric_values: { affected: f.affected, hours: f.hours, dollars: f.dollars },
    affected_count: f.affected,
    affected_pct: 0,
    dollar_impact: parseFloat(f.dollars.replace(/[$,K,M]/g, '')) * (f.dollars.includes('M') ? 1000000 : f.dollars.includes('K') ? 1000 : 1),
    hours_impact: parseFloat(f.hours.replace(/,/g, '')) || 0,
    dimensions: [],
    evidence_ref: `ev-${f.id}`,
    source_rule_ids: f.rules,
    citations: f.rules.map((r) => `${r} citation`),
    recommended_action: f.discussion,
    rule_conflict: false,
  }))
}

export function getInsightCards(): InsightCard[] {
  return [
    { card_id: 'ic-001', run_id: 'run-2026-05-20-a7f3', pay_practice: 'Overtime', headline: 'VTO hours inclusion is a systemic policy drift', body: 'St. Vincent is the only facility counting VTO toward OT threshold. This is not CBA-mandated; it is a local memo. Recommend central policy clarification.', finding_ids: ['F-0142'], severity: 'critical', recommended_action: 'Schedule policy review with St. Vincent HR and central compensation.' },
    { card_id: 'ic-002', run_id: 'run-2026-05-20-a7f3', pay_practice: 'Shift Differentials & Stacking', headline: 'Stacking cap inconsistency creates legal exposure', body: 'Toledo CBA §4.7 sets 35% cap, but Springfield and Warren CBAs do not mention stacking limits. Central policy is silent.', finding_ids: ['F-0118'], severity: 'critical', recommended_action: 'Draft central stacking cap addendum for all facilities.' },
  ]
}

export function getScenarios(): ScenarioResult[] {
  return [
    { scenario_id: 'sc-001', title: 'Align VTO/MTO to central policy', finding: 'F-0142', cost_impact: -1420000, hours_impact: -21440, employee_impact: 1428, pay_practice: 'Overtime' },
    { scenario_id: 'sc-002', title: 'Ratify facility exception (no change)', finding: 'F-0142', cost_impact: 0, hours_impact: 0, employee_impact: 0, pay_practice: 'Overtime' },
    { scenario_id: 'sc-003', title: 'Phased exclusion over 6 months', finding: 'F-0142', cost_impact: -890000, hours_impact: -13200, employee_impact: 1428, pay_practice: 'Overtime' },
    { scenario_id: 'sc-004', title: 'Normalize stacking cap at 35% (current strictest)', finding: 'F-0118', cost_impact: -612000, hours_impact: -8910, employee_impact: 612, pay_practice: 'Shift Differentials & Stacking' },
    { scenario_id: 'sc-005', title: 'Normalize stacking cap at 40% (median)', finding: 'F-0118', cost_impact: -184000, hours_impact: -2680, employee_impact: 212, pay_practice: 'Shift Differentials & Stacking' },
  ]
}

export function getCorpusStatus(): CorpusStatus {
  return {
    run_id: 'run-2026-05-20-a7f3',
    corpus_id: 'corpus-a7f3',
    status: 'ready',
    readiness_pct: 100,
    indexed_count: 14,
    total_count: 14,
    collection_name: 'run-2026-05-20-a7f3-docs',
    failed_documents: [],
  }
}

export function getRagAnswer(question: string): DocumentRAGAnswer {
  return {
    answer: `Based on the CBA and policy documents, ${question.toLowerCase().includes('overtime') ? 'overtime is paid at 1.5x the regular rate for hours beyond 40 in a workweek (CBA Article VII, Section 3a). The regular rate must include shift differential when applicable.' : question.toLowerCase().includes('shift') ? 'shift differential of $3.00/hr applies to all hours worked between 1900 and 0700 (CBA Article VIII, Section 1). Weekend differential of 15% applies to Saturday and Sunday regular hours.' : question.toLowerCase().includes('on-call') ? 'on-call pay is $12/hr for standby hours and 1.5x regular rate when called in (CBA Article IX, Section 2).' : 'the applicable policy is documented in the CBA and Pay Policy Handbook. Please specify the pay practice for a more detailed answer.'}`,
    answerable: true,
    confidence: 'high',
    corpus_id: 'corpus-a7f3',
    corpus_readiness_pct: 100,
    citations: [
      { chunk_id: 'c-1', filename: 'CBA_2024_2027.pdf', page: 14, section: 'Article VII', excerpt: 'Overtime shall be paid at one and one-half times...' },
      { chunk_id: 'c-3', filename: 'CBA_2024_2027.pdf', page: 18, section: 'Article VIII', excerpt: 'Shift differential of three dollars per hour...' },
    ],
    limitations: ['Answer based on CBA only; local MOUs may modify rates', 'Does not include recent addendums after 2026-01-01'],
  }
}

export function getReports(): ReportInfo[] {
  return [
    { report_id: 'rep-001', kind: 'deep-dive', status: 'generating', qa_status: 'pending', section_count: 24, unverified_claim_count: 3 },
    { report_id: 'rep-002', kind: 'executive', status: 'not_started' as const, qa_status: 'pending', section_count: 8, unverified_claim_count: 1 },
  ]
}

export function getSectionQA(): Array<{ section_id: string; title: string; qa_status: string; unverified_claims: number }> {
  return [
    { section_id: 'sec-001', title: 'Executive Summary', qa_status: 'passed', unverified_claims: 0 },
    { section_id: 'sec-002', title: 'Overtime Findings', qa_status: 'passed', unverified_claims: 1 },
    { section_id: 'sec-003', title: 'Shift Differential Analysis', qa_status: 'passed', unverified_claims: 1 },
    { section_id: 'sec-004', title: 'On-Call Pay Review', qa_status: 'passed', unverified_claims: 0 },
    { section_id: 'sec-005', title: 'Meal Premium Compliance', qa_status: 'passed', unverified_claims: 1 },
    { section_id: 'sec-006', title: 'Call-Back Pay Audit', qa_status: 'passed', unverified_claims: 0 },
  ]
}

export function getStatusAnswer(questionType: string): { question: string; answer: string } {
  const answers: Record<string, string> = {
    running: 'BL-EDA execution is currently running. The validation_and_bl_eda_graph is at node `bl_eda_subgraph`. 5 of 10 pay practices have completed; 2 are concurrently executing (Weekend Option, On Call & Callback). Send() fan-out is at the rate-limited concurrency cap.',
    completed: '16 stages completed from initialize_run through dq_gate. Notable: Document quality gate passed with 13/14 extracted and 1 OCR-recovered. Both review gates (BL Mapping at 11:04, DQ at 11:05) were approved with notes.',
    blockers: 'No blockers. Zero failed nodes. Zero paused review gates. Two advisory DQ issues remain open but do not block BL-EDA.',
    artifacts: '4 artifacts ready, 4 in progress. Per-practice evidence parquets for Overtime, Stacking, Consecutive Days, and Callback are persisted. Deep-dive report is rendering. Executive report is queued behind it.',
    next: 'Remaining graph path: bl_eda_evidence_aggregation → bl_eda_persistence → bl_eda_summary → bl_report_generation → deep_dive_report_trigger → executive_report_trigger → export_packaging → complete_run.',
  }
  const labels: Record<string, string> = {
    running: "What's running now?",
    completed: 'What completed?',
    blockers: 'Any blockers?',
    artifacts: 'What artifacts are ready?',
    next: "What's next?",
  }
  return { question: labels[questionType] || questionType, answer: answers[questionType] || 'Status information not available.' }
}

export function createRun(_payload: Record<string, unknown>): { run_id: string } {
  return { run_id: `run-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 6)}` }
}
