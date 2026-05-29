import type {
  BivariateProfile,
  BLEDAFinding,
  CatalogEntry,
  CorpusStatus,
  DocumentDetail,
  DocumentRAGAnswer,
  DocumentRecord,
  DocumentSummaryResponse,
  DQIssue,
  ExtractedRule,
  InsightCard,
  KeyFactor,
  KeyVariables,
  PayProvision,
  ProgressSnapshot,
  RelationshipIssue,
  ReportInfo,
  ReviewGate,
  RunStatus,
  RunSummary,
  ScenarioResult,
  StackingRule,
  TableProfile,
  VariationObservation,
  WorkforceContextProfile,
} from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })
  if (!res.ok) {
    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      body = await res.text().catch(() => null)
    }
    throw new ApiError(`${res.status} ${res.statusText}`, res.status, body)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function qs(params: Record<string, string | number | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (entries.length === 0) return ''
  const sp = new URLSearchParams()
  entries.forEach(([k, v]) => sp.set(k, String(v)))
  return `?${sp.toString()}`
}

// ---------- Paths preview (Run Setup) ----------

export interface PathPreviewFile {
  name: string
  size_bytes: number
  rel_path: string
}

export interface PathPreviewSide {
  exists: boolean
  files: PathPreviewFile[]
  count: number
}

export interface PathPreviewResponse {
  data: PathPreviewSide
  docs: PathPreviewSide
}

export function previewPaths(args: { data_path: string; docs_path: string }) {
  return fetchJson<PathPreviewResponse>(
    `/paths/preview${qs({ data_path: args.data_path, docs_path: args.docs_path })}`,
  )
}

// ---------- Runs ----------

export interface CreateRunBody {
  data_input_path: string
  documents_input_path: string
  tenant_id?: string
  user_id?: string
}

export interface RunResponse {
  run_id: string
  status: string
  tenant_id: string
  user_id: string
  data_input_path: string | null
  documents_input_path: string | null
  created_at: string
  updated_at: string
}

export function createRun(body: CreateRunBody) {
  return fetchJson<RunResponse>('/runs', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function listRuns() {
  return fetchJson<RunSummary[]>('/runs')
}

export function getRunStatus(runId: string) {
  return fetchJson<RunStatus>(`/runs/${runId}/status`)
}

export function getProgressSnapshot(runId: string) {
  return fetchJson<ProgressSnapshot>(`/runs/${runId}/progress`)
}

export function cancelRun(runId: string) {
  return fetchJson<{ run_id: string; status: string }>(`/runs/${runId}/cancel`, {
    method: 'POST',
  })
}

// ---------- DQ ----------

export interface DQGateStatus {
  gate_passed: boolean
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  waived_count: number
}

export function getDQStatus(runId: string) {
  return fetchJson<DQGateStatus>(`/runs/${runId}/dq/status`)
}

export function getDQIssues(runId: string) {
  return fetchJson<DQIssue[]>(`/runs/${runId}/dq/issues`)
}

export function waiveDQIssue(runId: string, issueId: string, notes: string) {
  return fetchJson<DQIssue>(`/runs/${runId}/dq/issues/${issueId}/waive`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}

export function rerunDQTable(runId: string, tableName: string, correctedFilePath: string) {
  return fetchJson<{ status: string; message: string }>(
    `/runs/${runId}/dq/tables/${tableName}/rerun`,
    { method: 'POST', body: JSON.stringify({ corrected_file_path: correctedFilePath }) },
  )
}

export function getTableProfiles(runId: string) {
  return fetchJson<{ profiles: TableProfile[] }>(`/runs/${runId}/dq/profiles`)
}

export function getBivariate(runId: string) {
  return fetchJson<{ profiles: BivariateProfile[] }>(`/runs/${runId}/dq/bivariate`)
}

export function getWorkforceContext(runId: string) {
  return fetchJson<{ run_id: string; context: WorkforceContextProfile } | { run_id: string; key: null }>(
    `/runs/${runId}/dq/workforce-context`,
  ).then(d => ('context' in d ? d.context : null))
}

export function getRelationships(runId: string) {
  return fetchJson<{
    run_id: string
    relationships: { run_id: string; issues: RelationshipIssue[]; checked_at: string }
  }>(`/runs/${runId}/dq/relationships`).then(d => ({ relationships: d.relationships.issues }))
}

export function getCatalog(runId: string) {
  return fetchJson<{ catalog: CatalogEntry[] }>(`/runs/${runId}/dq/catalog`)
}

// ---------- Documents ----------

export function getDocuments(runId: string) {
  return fetchJson<DocumentRecord[]>(`/runs/${runId}/documents`)
}

export function getDocumentDetail(runId: string, docId: string) {
  return fetchJson<DocumentDetail>(`/runs/${runId}/documents/${docId}`)
}

export function getDocumentSummary(runId: string, docId: string) {
  return fetchJson<DocumentSummaryResponse>(`/runs/${runId}/documents/${docId}/summary`)
}

export function getRulesForDocument(runId: string, docId: string) {
  return fetchJson<ExtractedRule[]>(`/runs/${runId}/documents/${docId}/rules`)
}

export function getRulesForRun(runId: string) {
  return fetchJson<ExtractedRule[]>(`/runs/${runId}/rules`)
}

export function getDocumentQuality(runId: string) {
  return fetchJson<Record<string, unknown>>(`/runs/${runId}/document-quality`)
}

export function flagRule(runId: string, ruleId: string, notes: string) {
  return fetchJson<{ rule_id: string; flagged: boolean }>(`/runs/${runId}/rules/${ruleId}/flag`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}

export function submitRuleReviewDecision(
  runId: string,
  ruleId: string,
  decision: 'manual_approval' | 'mapping_correction' | 'testability_override',
  notes: string,
) {
  return fetchJson<{ rule_id: string; decision: string }>(`/runs/${runId}/rules/review-decision`, {
    method: 'POST',
    body: JSON.stringify({ rule_id: ruleId, review_type: decision, decision: 'approved', notes }),
  })
}

export function getPayProvisionMetrics(runId: string) {
  return fetchJson<string[]>(`/runs/${runId}/pay-provisions/metrics`)
}

export function getPayProvisions(runId: string, metric?: string) {
  return fetchJson<PayProvision[]>(`/runs/${runId}/pay-provisions${qs({ metric })}`)
}

export function getStackingRules(runId: string, metric?: string) {
  return fetchJson<StackingRule[]>(`/runs/${runId}/stacking-rules${qs({ metric })}`)
}

export function getVariationObservations(runId: string, metric?: string) {
  return fetchJson<VariationObservation[]>(`/runs/${runId}/variation-observations${qs({ metric })}`)
}

// ---------- Review Gates ----------

export function getReviewGates(runId: string) {
  return fetchJson<ReviewGate[]>(`/runs/${runId}/review-requests`)
}

export function submitReviewDecision(
  runId: string,
  reviewId: string,
  body: { decision: 'approve' | 'request_rework' | 'cancel'; notes: string },
) {
  return fetchJson<{ decision_id: string }>(
    `/runs/${runId}/review-requests/${reviewId}/decision`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}

// ---------- BL-EDA ----------

export interface BLEDAStatus {
  run_id: string
  events?: Array<{ event_type: string; node_name?: string; at: string; payload?: unknown }>
  event_count?: number
}

export function getBLEDAStatus(runId: string) {
  return fetchJson<BLEDAStatus>(`/runs/${runId}/bl-eda/status`)
}

export interface FindingsFilters {
  pay_practice?: string
  severity?: string
  status?: string
}

export function getFindings(runId: string, filters?: FindingsFilters) {
  return fetchJson<{ findings: BLEDAFinding[] }>(
    `/runs/${runId}/bl-eda/findings${qs({ ...(filters ?? {}) })}`,
  )
}

export function getInsightCards(runId: string) {
  return fetchJson<{ insight_cards: InsightCard[] }>(`/runs/${runId}/bl-eda/insights`)
}

export function getScenarios(runId: string) {
  return fetchJson<{ scenarios: ScenarioResult[] }>(`/runs/${runId}/bl-eda/scenarios`).catch(
    () => ({ scenarios: [] as ScenarioResult[] }),
  )
}

export function startBLEDA(runId: string) {
  return fetchJson<{ run_id: string; status: string }>(`/runs/${runId}/bl-eda/start`, {
    method: 'POST',
  })
}

export function getKeyFactors(runId: string) {
  return fetchJson<{ factors: KeyFactor[] }>(`/runs/${runId}/bl-eda/key-factors`)
}

export function getKeyVariables(runId: string) {
  return fetchJson<KeyVariables>(`/runs/${runId}/bl-eda/key-variables`)
}

export function getBLEDAWorkplan(runId: string) {
  return fetchJson<Record<string, unknown>>(`/runs/${runId}/bl-eda/plan`)
}

export function getBLEDAEvidence(runId: string, findingId: string) {
  return fetchJson<unknown>(`/runs/${runId}/bl-eda/evidence/${findingId}`)
}

export function recomputeBLEDA(runId: string, jobIds?: string[]) {
  return fetchJson<{ recompute_run_id: string; status: string }>(`/runs/${runId}/bl-eda/recompute`, {
    method: 'POST',
    body: JSON.stringify({ job_ids: jobIds ?? null }),
  })
}

// ---------- Document RAG ----------

export function getCorpusStatus(runId: string) {
  return fetchJson<CorpusStatus>(`/document-rag/status${qs({ run_id: runId })}`)
}

export interface AskRAGBody {
  run_id: string
  question: string
  top_k?: number
  score_threshold?: number
}

export function askDocumentRAG(body: AskRAGBody) {
  return fetchJson<DocumentRAGAnswer>(`/document-rag/chat`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ---------- Reports ----------

export function getReports(runId: string) {
  return fetchJson<{ reports: ReportInfo[] }>(`/runs/${runId}/reports`)
}

export function getSectionQA(runId: string) {
  return fetchJson<{
    sections?: Array<{ section_id: string; title: string; qa_status: string; unverified_claims: number }>
  }>(`/runs/${runId}/reports/section-qa`)
}

export function generateReport(runId: string, kind: 'deep-dive' | 'executive') {
  return fetchJson<ReportInfo>(`/runs/${runId}/reports/${kind}`, {
    method: 'POST',
  })
}

export async function downloadReport(runId: string, kind: 'deep-dive' | 'executive') {
  const res = await fetch(`${BASE_URL}/runs/${runId}/reports/${kind}/download`)
  if (!res.ok) {
    throw new ApiError(`${res.status} ${res.statusText}`, res.status, await res.text().catch(() => null))
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${kind}-report-${runId}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ---------- Status Chat ----------

export type StatusQuestionType =
  | 'what_is_running_now'
  | 'what_completed'
  | 'any_blockers'
  | 'artifacts_ready'
  | 'whats_next'

export interface StatusChatRequest {
  run_id: string
  question_type: StatusQuestionType
}

export interface StatusChatResponse {
  question: string
  answer: string
}

export function askStatus(body: StatusChatRequest) {
  return fetchJson<StatusChatResponse>(`/status-chat`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
