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
  KeyFactor,
  KeyVariableGroup,
} from '@/types/api'

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
    current_node: 'bl_eda_synthesis',
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
      { stage_id: 's1', name: 'Run Setup', status: 'completed', progress_pct: 100 },
      { stage_id: 's2', name: 'Data Ingestion & DQ', status: 'completed', progress_pct: 100 },
      { stage_id: 's3', name: 'Document Intelligence', status: 'completed', progress_pct: 100 },
      { stage_id: 's4', name: 'Semantic Mapping', status: 'completed', progress_pct: 100 },
      { stage_id: 's5', name: 'BL-EDA', status: 'running', progress_pct: 45, sub_stages: [
        { stage_id: 's5a', name: 'Pay Practice: Overtime', status: 'completed', progress_pct: 100 },
        { stage_id: 's5b', name: 'Pay Practice: Shift Differential', status: 'completed', progress_pct: 100 },
        { stage_id: 's5c', name: 'Pay Practice: On-Call Pay', status: 'running', progress_pct: 60 },
        { stage_id: 's5d', name: 'Pay Practice: Meal/Rest Premium', status: 'not_started', progress_pct: 0 },
        { stage_id: 's5e', name: 'Pay Practice: Call-Back Pay', status: 'not_started', progress_pct: 0 },
      ]},
      { stage_id: 's6', name: 'Report Generation', status: 'not_started', progress_pct: 0 },
      { stage_id: 's7', name: 'Export Packaging', status: 'not_started', progress_pct: 0 },
      { stage_id: 's8', name: 'Complete', status: 'not_started', progress_pct: 0 },
    ],
  }
}

export function getDQIssues(): DQIssue[] {
  return [
    { issue_id: 'dq-001', run_id: 'run-2026-05-20-a7f3', table_name: 'payroll', column_name: 'hours_worked', check_type: 'null_rate', severity: 'critical', description: 'Null rate of 12.3% exceeds threshold of 5%', affected_row_count: 1842, status: 'open' },
    { issue_id: 'dq-002', run_id: 'run-2026-05-20-a7f3', table_name: 'payroll', column_name: 'pay_rate', check_type: 'outlier_iqr', severity: 'high', description: '347 rows with pay rate > 3 IQR above median', affected_row_count: 347, status: 'open' },
    { issue_id: 'dq-003', run_id: 'run-2026-05-20-a7f3', table_name: 'employees', column_name: 'department_id', check_type: 'foreign_key', severity: 'high', description: '892 employee records reference non-existent department_ids', affected_row_count: 892, status: 'waived', waive_notes: 'Legacy contractor records without department assignment', waived_at: '2026-05-20T05:12:00Z' },
    { issue_id: 'dq-004', run_id: 'run-2026-05-20-a7f3', table_name: 'timecards', column_name: 'date', check_type: 'future_date', severity: 'medium', description: '23 records with future dates (after 2026-05-20)', affected_row_count: 23, status: 'open' },
    { issue_id: 'dq-005', run_id: 'run-2026-05-20-a7f3', table_name: 'payroll', column_name: 'overtime_hours', check_type: 'negative_value', severity: 'medium', description: '14 records with negative overtime hours', affected_row_count: 14, status: 'open' },
    { issue_id: 'dq-006', run_id: 'run-2026-05-20-a7f3', table_name: 'payroll', column_name: 'gross_pay', check_type: 'skewness', severity: 'low', description: 'Skewness of 4.2 indicates heavy right tail', affected_row_count: 0, status: 'open' },
  ]
}

export function getDQStatus(): { gate_passed: boolean; critical_count: number; high_count: number; medium_count: number; waived_count: number } {
  return { gate_passed: false, critical_count: 1, high_count: 2, medium_count: 2, waived_count: 1 }
}

export function getTableProfiles(): TableProfile[] {
  return [
    {
      table_name: 'payroll',
      row_count: 14987,
      column_count: 18,
      longitudinal: true,
      periods: 12,
      column_profiles: [
        { column: 'employee_id', type: 'string', null_rate: 0, unique_count: 1240, top_values: [{ value: 'E-1042', count: 12 }] },
        { column: 'pay_rate', type: 'numeric', null_rate: 0.02, unique_count: 89, mean: 42.5, std: 18.3, min: 15.0, max: 195.0, skewness: 2.1, iqr_outlier_rate: 0.023 },
        { column: 'hours_worked', type: 'numeric', null_rate: 0.123, unique_count: 56, mean: 78.4, std: 12.1, min: 0, max: 120.0, skewness: -0.4, iqr_outlier_rate: 0.008 },
        { column: 'department_id', type: 'string', null_rate: 0.06, unique_count: 14, top_values: [{ value: 'DEPT-ICU', count: 4231 }, { value: 'DEPT-ER', count: 3187 }] },
        { column: 'pay_code', type: 'string', null_rate: 0, unique_count: 23, top_values: [{ value: 'REG', count: 10432 }, { value: 'OT', count: 2891 }] },
      ],
    },
    {
      table_name: 'employees',
      row_count: 1240,
      column_count: 9,
      longitudinal: false,
      periods: 1,
      column_profiles: [
        { column: 'employee_id', type: 'string', null_rate: 0, unique_count: 1240 },
        { column: 'hire_date', type: 'date', null_rate: 0.01, unique_count: 432 },
        { column: 'job_title', type: 'string', null_rate: 0.03, unique_count: 34, top_values: [{ value: 'RN', count: 412 }, { value: 'LPN', count: 298 }] },
      ],
    },
  ]
}

export function getBivariateProfiles(): BivariateProfile[] {
  return [
    {
      table_name: 'payroll',
      measure_correlations: [
        { col_a: 'pay_rate', col_b: 'gross_pay', assoc_type: 'pearson', value: 0.92 },
        { col_a: 'hours_worked', col_b: 'gross_pay', assoc_type: 'pearson', value: 0.78 },
        { col_a: 'overtime_hours', col_b: 'gross_pay', assoc_type: 'pearson', value: 0.65 },
      ],
      vif_scores: [
        { column: 'pay_rate', vif: 1.2, risk: 'low' },
        { column: 'hours_worked', vif: 3.4, risk: 'moderate' },
        { column: 'overtime_hours', vif: 8.9, risk: 'high' },
        { column: 'gross_pay', vif: 12.3, risk: 'critical' },
      ],
      dimension_measure_assoc: [
        { dimension: 'department_id', measure: 'pay_rate', stat: 48.2, p_value: 0.001 },
        { dimension: 'pay_code', measure: 'hours_worked', stat: 124.5, p_value: 0.0001 },
      ],
      dimension_pair_assoc: [
        { dim_a: 'department_id', dim_b: 'pay_code', cramers_v: 0.34 },
        { dim_a: 'shift', dim_b: 'pay_code', cramers_v: 0.56 },
      ],
      high_correlation_pairs: 2,
      profiled_at: '2026-05-20T04:30:00Z',
    },
  ]
}

export function getWorkforceContext(): WorkforceContextProfile {
  return {
    run_id: 'run-2026-05-20-a7f3',
    tables_analyzed: ['payroll', 'timecards', 'employees'],
    pay_code_concentration: [
      { code: 'REG', hours: 10432, pct: 69.6 },
      { code: 'OT', hours: 2891, pct: 19.3 },
      { code: 'PREM', hours: 987, pct: 6.6 },
      { code: 'ONCALL', hours: 412, pct: 2.8 },
      { code: 'CBACK', hours: 265, pct: 1.7 },
    ],
    top_codes_80pct_threshold: 3,
    temporal_period_stats: [
      { period: '2025-06', total_hours: 12450, headcount: 1180 },
      { period: '2025-07', total_hours: 11980, headcount: 1192 },
      { period: '2025-08', total_hours: 12100, headcount: 1201 },
      { period: '2025-09', total_hours: 12340, headcount: 1195 },
      { period: '2025-10', total_hours: 12560, headcount: 1210 },
      { period: '2025-11', total_hours: 11890, headcount: 1205 },
    ],
    time_grain: 'monthly',
    segment_health_scores: [
      { segment: 'DEPT-ICU', dq_score: 0.91 },
      { segment: 'DEPT-ER', dq_score: 0.87 },
      { segment: 'DEPT-SURG', dq_score: 0.94 },
      { segment: 'DEPT-ADMIN', dq_score: 0.96 },
      { segment: 'DEPT-LAB', dq_score: 0.82 },
    ],
    hour_distribution: [
      { category: 'Regular', hours: 10432, pct: 69.6 },
      { category: 'Overtime', hours: 2891, pct: 19.3 },
      { category: 'Premium', hours: 1664, pct: 11.1 },
    ],
    detected_payroll_table: 'payroll',
    detected_value_column: 'gross_pay',
    detected_hours_column: 'hours_worked',
    detected_pay_code_column: 'pay_code',
    profiled_at: '2026-05-20T04:35:00Z',
  }
}

export function getRelationships(): RelationshipEntry[] {
  return [
    { table_a: 'payroll', column_a: 'employee_id', table_b: 'employees', column_b: 'employee_id', relationship_type: 'foreign_key', confidence: 0.99 },
    { table_a: 'payroll', column_a: 'department_id', table_b: 'departments', column_b: 'department_id', relationship_type: 'foreign_key', confidence: 0.95 },
    { table_a: 'timecards', column_a: 'employee_id', table_b: 'employees', column_b: 'employee_id', relationship_type: 'foreign_key', confidence: 0.98 },
    { table_a: 'timecards', column_a: 'payroll_period_id', table_b: 'payroll_periods', column_b: 'period_id', relationship_type: 'foreign_key', confidence: 0.97 },
  ]
}

export function getCatalog(): CatalogEntry[] {
  return [
    { table_name: 'payroll', column_name: 'employee_id', data_type: 'varchar(32)', null_rate: 0, uniqueness: 1, inferred_semantic_type: 'entity_key' },
    { table_name: 'payroll', column_name: 'pay_rate', data_type: 'decimal(10,2)', null_rate: 0.02, uniqueness: 0.07, inferred_semantic_type: 'monetary_rate' },
    { table_name: 'payroll', column_name: 'hours_worked', data_type: 'decimal(6,2)', null_rate: 0.123, uniqueness: 0.04, inferred_semantic_type: 'duration_hours' },
    { table_name: 'employees', column_name: 'employee_id', data_type: 'varchar(32)', null_rate: 0, uniqueness: 1, inferred_semantic_type: 'entity_key' },
    { table_name: 'employees', column_name: 'hire_date', data_type: 'date', null_rate: 0.01, uniqueness: 0.35, inferred_semantic_type: 'date' },
  ]
}

export function getDocuments(): DocumentRecord[] {
  return [
    { document_id: 'doc-001', filename: 'CBA_2024_2027.pdf', status: 'processed', document_type: 'CBA', chunk_count: 142, rule_count: 38 },
    { document_id: 'doc-002', filename: 'Pay_Policy_Handbook_v3.pdf', status: 'processed', document_type: 'Policy', chunk_count: 89, rule_count: 24 },
    { document_id: 'doc-003', filename: 'Overtime_Provisions_Addendum.pdf', status: 'processed', document_type: 'Addendum', chunk_count: 34, rule_count: 12 },
    { document_id: 'doc-004', filename: 'Shift_Differential_Guidelines.md', status: 'processed', document_type: 'Guidelines', chunk_count: 21, rule_count: 8 },
    { document_id: 'doc-005', filename: 'OnCall_Pay_Matrix.xlsx', status: 'processing', document_type: 'Matrix', chunk_count: 0, rule_count: 0 },
  ]
}

export function getRulesForDocument(docId: string): ExtractedRule[] {
  const rules: Record<string, ExtractedRule[]> = {
    'doc-001': [
      { rule_id: 'r-001', run_id: 'run-2026-05-20-a7f3', document_id: 'doc-001', source_chunk_ids: ['c-1', 'c-2'], primary_chunk_id: 'c-1', rule_text: 'Overtime shall be paid at 1.5x the regular rate for hours worked beyond 40 in a workweek.', rule_type: 'threshold', citation_status: 'verified', citation_text: 'CBA Article VII, Section 3(a)', governed_data_concepts: ['overtime_hours', 'regular_rate', 'gross_pay'], candidate_tables: ['payroll'], confidence: 0.97, testability: 'testable', extraction_warnings: [], requires_human_review: false, extracted_at: '2026-05-20T04:10:00Z' },
      { rule_id: 'r-002', run_id: 'run-2026-05-20-a7f3', document_id: 'doc-001', source_chunk_ids: ['c-3'], primary_chunk_id: 'c-3', rule_text: 'Shift differential of $3.00/hr applies to all hours worked between 1900 and 0700.', rule_type: 'formula', citation_status: 'verified', citation_text: 'CBA Article VIII, Section 1', governed_data_concepts: ['shift_hours', 'differential_rate', 'gross_pay'], candidate_tables: ['payroll'], confidence: 0.95, testability: 'testable', extraction_warnings: [], requires_human_review: false, extracted_at: '2026-05-20T04:10:00Z' },
      { rule_id: 'r-003', run_id: 'run-2026-05-20-a7f3', document_id: 'doc-001', source_chunk_ids: ['c-4'], primary_chunk_id: 'c-4', rule_text: 'On-call pay shall be $12/hr for standby hours and 1.5x regular rate when called in.', rule_type: 'formula', citation_status: 'verified', citation_text: 'CBA Article IX, Section 2', governed_data_concepts: ['oncall_hours', 'regular_rate', 'gross_pay'], candidate_tables: ['payroll'], confidence: 0.94, testability: 'testable', extraction_warnings: [], requires_human_review: false, extracted_at: '2026-05-20T04:10:00Z' },
    ],
    'doc-002': [
      { rule_id: 'r-004', run_id: 'run-2026-05-20-a7f3', document_id: 'doc-002', source_chunk_ids: ['c-10'], primary_chunk_id: 'c-10', rule_text: 'Meal premium of 1 hour pay due when employee misses meal break after 5 hours.', rule_type: 'threshold', citation_status: 'verified', citation_text: 'Handbook Section 4.2.1', governed_data_concepts: ['meal_break_flag', 'hours_worked', 'gross_pay'], candidate_tables: ['timecards', 'payroll'], confidence: 0.91, testability: 'testable', extraction_warnings: ['Break data may be in separate system'], requires_human_review: true, extracted_at: '2026-05-20T04:12:00Z' },
      { rule_id: 'r-005', run_id: 'run-2026-05-20-a7f3', document_id: 'doc-002', source_chunk_ids: ['c-11'], primary_chunk_id: 'c-11', rule_text: 'Call-back pay minimum of 4 hours at 1.5x regular rate regardless of time worked.', rule_type: 'threshold', citation_status: 'verified', citation_text: 'Handbook Section 5.1', governed_data_concepts: ['callback_hours', 'regular_rate', 'gross_pay'], candidate_tables: ['payroll'], confidence: 0.93, testability: 'testable', extraction_warnings: [], requires_human_review: false, extracted_at: '2026-05-20T04:12:00Z' },
    ],
    'doc-003': [
      { rule_id: 'r-006', run_id: 'run-2026-05-20-a7f3', document_id: 'doc-003', source_chunk_ids: ['c-20'], primary_chunk_id: 'c-20', rule_text: 'Double time for hours worked beyond 12 in a single shift.', rule_type: 'threshold', citation_status: 'verified', citation_text: 'Addendum A, Paragraph 3', governed_data_concepts: ['shift_hours', 'regular_rate', 'gross_pay'], candidate_tables: ['payroll'], confidence: 0.96, testability: 'testable', extraction_warnings: [], requires_human_review: false, extracted_at: '2026-05-20T04:14:00Z' },
    ],
    'doc-004': [
      { rule_id: 'r-007', run_id: 'run-2026-05-20-a7f3', document_id: 'doc-004', source_chunk_ids: ['c-30'], primary_chunk_id: 'c-30', rule_text: 'Weekend shift differential of 15% applies to all regular hours worked Saturday or Sunday.', rule_type: 'formula', citation_status: 'partial', citation_text: 'Guidelines page 4', governed_data_concepts: ['weekend_hours', 'regular_rate', 'gross_pay'], candidate_tables: ['payroll'], confidence: 0.82, testability: 'partial', extraction_warnings: ['Weekend definition not explicitly stated'], requires_human_review: true, extracted_at: '2026-05-20T04:15:00Z' },
      { rule_id: 'r-008', run_id: 'run-2026-05-20-a7f3', document_id: 'doc-004', source_chunk_ids: ['c-31'], primary_chunk_id: 'c-31', rule_text: 'Holiday pay at 2.5x regular rate for designated holidays per the annual calendar.', rule_type: 'formula', citation_status: 'verified', citation_text: 'Guidelines page 6', governed_data_concepts: ['holiday_hours', 'regular_rate', 'gross_pay'], candidate_tables: ['payroll'], confidence: 0.89, testability: 'testable', extraction_warnings: ['Holiday calendar reference not resolved'], requires_human_review: false, extracted_at: '2026-05-20T04:15:00Z' },
    ],
    'doc-005': [],
  }
  return rules[docId] || []
}

export function getReviewGates(): ReviewGate[] {
  return [
    { review_id: 'rg-001', run_id: 'run-2026-05-20-a7f3', gate_name: 'BL Mapping Review Gate', status: 'approved', guards: 'All semantic mappings validated and rule conflicts resolved or flagged.', details: 'Semantic mapping review completed. 3 rules flagged for human review. 1 conflict between overtime threshold rules resolved by selecting CBA_2024_2027.pdf as authoritative.', },
    { review_id: 'rg-002', run_id: 'run-2026-05-20-a7f3', gate_name: 'Report QA Review Gate', status: 'not_reached', guards: 'Deep-dive and executive reports generated and QA-checked.', details: 'Gate not yet reached. Reports will be generated after BL-EDA completion.' },
  ]
}

export function getFindings(): BLEDAFinding[] {
  return [
    { finding_id: 'f-001', run_id: 'run-2026-05-20-a7f3', pay_practice: 'Overtime', check_family: 'threshold_verification', check_name: 'OT_Rate_Compliance', status: 'open', severity: 'critical', title: 'Overtime rate underpayment across 412 employees', finding: 'Analysis shows 412 employees were paid at 1.25x instead of required 1.5x for OT hours in Q1 2026. Estimated underpayment of $284,000.', metric_values: { 'underpaid_hours': 12400, 'avg_underpayment_per_employee': 689.32, 'max_underpayment': 1240.50 }, affected_count: 412, affected_pct: 33.2, dollar_impact: 284000, hours_impact: 12400, dimensions: ['DEPT-ICU', 'DEPT-ER'], evidence_ref: 'ev-001', source_rule_ids: ['r-001'], citations: ['CBA Article VII, Section 3(a)'], recommended_action: 'Retroactive payment adjustment required for all affected employees.', rule_conflict: false },
    { finding_id: 'f-002', run_id: 'run-2026-05-20-a7f3', pay_practice: 'Shift Differential', check_family: 'formula_check', check_name: 'Shift_Diff_Application', status: 'open', severity: 'high', title: 'Night shift differential missing for 189 employees', finding: '189 employees working night shifts (1900-0700) did not receive the $3.00/hr differential. System configuration shows differential rule disabled for DEPT-ICU and DEPT-ER.', metric_values: { 'missing_hours': 8900, 'avg_diff_per_hour': 3.0, 'total_missing': 26700 }, affected_count: 189, affected_pct: 15.2, dollar_impact: 26700, hours_impact: 8900, dimensions: ['DEPT-ICU', 'DEPT-ER'], evidence_ref: 'ev-002', source_rule_ids: ['r-002'], citations: ['CBA Article VIII, Section 1'], recommended_action: 'Enable differential rule for all applicable departments and process back-pay.', rule_conflict: false },
    { finding_id: 'f-003', run_id: 'run-2026-05-20-a7f3', pay_practice: 'On-Call Pay', check_family: 'threshold_verification', check_name: 'OnCall_Standby_Rate', status: 'open', severity: 'high', title: 'On-call standby rate below CBA minimum', finding: 'Current on-call standby rate is $10/hr, below the CBA-mandated $12/hr. Affects all 78 on-call staff across 6 departments.', metric_values: { 'affected_staff': 78, 'rate_gap': 2.0, 'annual_gap': 162240 }, affected_count: 78, affected_pct: 6.3, dollar_impact: 162240, hours_impact: 0, dimensions: ['DEPT-ICU', 'DEPT-ER', 'DEPT-SURG'], evidence_ref: 'ev-003', source_rule_ids: ['r-003'], citations: ['CBA Article IX, Section 2'], recommended_action: 'Update on-call rate in payroll system and process adjustment.', rule_conflict: false },
    { finding_id: 'f-004', run_id: 'run-2026-05-20-a7f3', pay_practice: 'Meal/Rest Premium', check_family: 'formula_check', check_name: 'Meal_Premium_Compliance', status: 'open', severity: 'medium', title: 'Meal premium not paid for 67 missed breaks', finding: '67 instances where employees worked >5 hours without a meal break but did not receive the 1-hour meal premium. Timecard data shows break flags not propagated to payroll.', metric_values: { 'missed_breaks': 67, 'premium_per_case': 42.5, 'total_missing': 2847.5 }, affected_count: 67, affected_pct: 5.4, dollar_impact: 2847.5, hours_impact: 67, dimensions: ['DEPT-ICU', 'DEPT-LAB'], evidence_ref: 'ev-004', source_rule_ids: ['r-004'], citations: ['Handbook Section 4.2.1'], recommended_action: 'Fix integration between timecard and payroll systems for break premium.', rule_conflict: false },
    { finding_id: 'f-005', run_id: 'run-2026-05-20-a7f3', pay_practice: 'Call-Back Pay', check_family: 'threshold_verification', check_name: 'Callback_Minimum_Hours', status: 'open', severity: 'medium', title: 'Call-back minimum hours not applied in 23 cases', finding: '23 call-back instances paid for actual time only (avg 1.8 hrs) instead of minimum 4 hours at 1.5x rate. Policy not configured in payroll system.', metric_values: { 'short_payments': 23, 'avg_gap_hours': 2.2, 'total_gap': 50.6 }, affected_count: 23, affected_pct: 1.9, dollar_impact: 3218, hours_impact: 50.6, dimensions: ['DEPT-ER', 'DEPT-SURG'], evidence_ref: 'ev-005', source_rule_ids: ['r-005'], citations: ['Handbook Section 5.1'], recommended_action: 'Configure callback minimum hours rule and process retroactive adjustments.', rule_conflict: false },
    { finding_id: 'f-006', run_id: 'run-2026-05-20-a7f3', pay_practice: 'Overtime', check_family: 'stacking_verification', check_name: 'OT_Stacking_Rule', status: 'open', severity: 'critical', title: 'Overtime and shift differential stacking violation', finding: 'OT hours are calculated on base rate only, excluding shift differential. CBA requires OT calculated on total regular rate including differential. Affects 298 employees.', metric_values: { 'affected_employees': 298, 'underpayment_per_employee': 124.3, 'total_underpayment': 37041.4 }, affected_count: 298, affected_pct: 24.0, dollar_impact: 37041, hours_impact: 0, dimensions: ['DEPT-ICU', 'DEPT-ER'], evidence_ref: 'ev-006', source_rule_ids: ['r-001', 'r-002'], citations: ['CBA Article VII, Section 3(a)', 'CBA Article VIII, Section 1'], recommended_action: 'Update OT calculation formula to include shift differential in regular rate.', rule_conflict: true, rule_conflict_priority: 'high' },
  ]
}

export function getInsightCards(): InsightCard[] {
  return [
    { card_id: 'ic-001', run_id: 'run-2026-05-20-a7f3', pay_practice: 'Overtime', headline: 'Systemic OT underpayment pattern', body: 'The OT rate underpayment is not isolated; it correlates strongly with department and tenure. ICU and ER show the highest incidence, suggesting a configuration issue tied to these cost centers.', finding_ids: ['f-001', 'f-006'], severity: 'critical', recommended_action: 'Audit payroll system configuration for DEPT-ICU and DEPT-ER rate tables.' },
    { card_id: 'ic-002', run_id: 'run-2026-05-20-a7f3', pay_practice: 'Shift Differential', headline: 'Night shift retention risk', body: 'Missing shift differentials for night staff create a measurable pay equity gap. Exit interview data correlation recommended.', finding_ids: ['f-002'], severity: 'high', recommended_action: 'Conduct retention analysis for night-shift RNs and LPNs.' },
  ]
}

export function getScenarios(): ScenarioResult[] {
  return [
    { scenario_id: 'sc-001', title: 'Retroactive payment (full)', finding: 'f-001', cost_impact: 284000, hours_impact: 0, employee_impact: 412, pay_practice: 'Overtime' },
    { scenario_id: 'sc-002', title: 'Retroactive payment (6-month lookback)', finding: 'f-001', cost_impact: 142000, hours_impact: 0, employee_impact: 398, pay_practice: 'Overtime' },
    { scenario_id: 'sc-003', title: 'Going-forward fix only', finding: 'f-001', cost_impact: 0, hours_impact: 0, employee_impact: 412, pay_practice: 'Overtime' },
    { scenario_id: 'sc-004', title: 'Full back-pay for shift differential', finding: 'f-002', cost_impact: 26700, hours_impact: 8900, employee_impact: 189, pay_practice: 'Shift Differential' },
  ]
}

export function getKeyFactors(): KeyFactor[] {
  return [
    { type: 'monotonic', measure: 'overtime_hours', dimension: 'department_id', effect: 'ICU and ER show 3x higher OT hours per employee', tier: 1 },
    { type: 'segment_variance', measure: 'pay_rate', dimension: 'job_title', effect: 'RN vs LPN gap exceeds 40% in 4 departments', tier: 1 },
    { type: 'temporal_trend', measure: 'gross_pay', dimension: 'pay_period', effect: 'Q1 2026 pay spiked 12% vs Q4 2025', tier: 2 },
    { type: 'concentration', measure: 'hours_worked', dimension: 'pay_code', effect: 'REG code dominates 69.6% of all hours', tier: 3 },
  ]
}

export function getKeyVariables(): KeyVariableGroup[] {
  return [
    { group: 'Measures', variables: [
      { name: 'gross_pay', rank: 1, importance: 0.94 },
      { name: 'hours_worked', rank: 2, importance: 0.89 },
      { name: 'pay_rate', rank: 3, importance: 0.87 },
      { name: 'overtime_hours', rank: 4, importance: 0.72 },
    ]},
    { group: 'Dimensions', variables: [
      { name: 'department_id', rank: 1, importance: 0.81 },
      { name: 'job_title', rank: 2, importance: 0.76 },
      { name: 'pay_code', rank: 3, importance: 0.68 },
      { name: 'shift', rank: 4, importance: 0.54 },
    ]},
    { group: 'Time Columns', variables: [
      { name: 'pay_period', rank: 1, importance: 0.62 },
      { name: 'hire_date', rank: 2, importance: 0.41 },
    ]},
    { group: 'Entity Keys', variables: [
      { name: 'employee_id', rank: 1, importance: 1.0 },
    ]},
  ]
}

export function getCorpusStatus(): CorpusStatus {
  return {
    run_id: 'run-2026-05-20-a7f3',
    corpus_id: 'corpus-a7f3',
    status: 'ready',
    readiness_pct: 100,
    indexed_count: 5,
    total_count: 5,
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
    { report_id: 'rep-001', kind: 'deep-dive', status: 'completed', qa_status: 'passed', section_count: 24, unverified_claim_count: 3, generated_at: '2026-05-20T05:30:00Z' },
    { report_id: 'rep-002', kind: 'executive', status: 'completed', qa_status: 'passed', section_count: 8, unverified_claim_count: 1, generated_at: '2026-05-20T05:35:00Z' },
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
    'running': 'BL-EDA Synthesis is currently running. Sub-stage "On-Call Pay" is active (60% complete). Estimated remaining: 18 minutes.',
    'completed': 'Completed stages: Run Setup, Data Ingestion & DQ, Document Intelligence, Semantic Mapping. Completed sub-stages: Overtime, Shift Differential.',
    'blockers': 'No blockers at this time. The run is progressing normally. Next review gate (Report QA) will appear after Report Generation.',
    'artifacts': 'Artifacts ready: DQ profiles, EDA profiles, bivariate analysis, workforce context, document extraction rules, semantic mappings, BL-EDA findings (partial).',
    'next': 'Next: Complete On-Call Pay sub-stage, then Meal/Rest Premium and Call-Back Pay sub-stages, followed by BL-EDA persistence and Report Generation.',
  }
  const labels: Record<string, string> = {
    'running': "What's running now?",
    'completed': 'What completed?',
    'blockers': 'Any blockers?',
    'artifacts': 'What artifacts are ready?',
    'next': "What's next?",
  }
  return { question: labels[questionType] || questionType, answer: answers[questionType] || 'Status information not available.' }
}

export function createRun(_payload: Record<string, unknown>): { run_id: string } {
  return { run_id: `run-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 6)}` }
}
