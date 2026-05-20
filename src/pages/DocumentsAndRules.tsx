import { useState } from 'react'
import StatusBadge from '@/components/StatusBadge'
import { getDocuments, getRulesForDocument } from '@/api/mock'

export default function DocumentsAndRules() {
  const docs = getDocuments()
  const [selected, setSelected] = useState(docs[0]?.document_id || '')
  const rules = getRulesForDocument(selected)
  const selectedDoc = docs.find((d) => d.document_id === selected)

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Documents & Rules</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Document Intelligence</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">Documents ({docs.length})</p>
          {docs.map((doc) => (
            <button key={doc.document_id} onClick={() => setSelected(doc.document_id)} className={`w-full rounded-lg border p-3 text-left transition-colors ${selected === doc.document_id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{doc.filename}</span>
                <StatusBadge status={doc.status} />
              </div>
              <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                <span>{doc.document_type}</span>
                <span>{doc.chunk_count} chunks</span>
                <span>{doc.rule_count} rules</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-3">
          {selectedDoc && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{selectedDoc.filename}</h2>
                <StatusBadge status={selectedDoc.status} />
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>Type: {selectedDoc.document_type}</span>
                <span>Chunks: {selectedDoc.chunk_count}</span>
                <span>Rules: {selectedDoc.rule_count}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {rules.length === 0 && <p className="text-sm text-muted-foreground">No rules extracted for this document.</p>}
            {rules.map((rule) => (
              <div key={rule.rule_id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">{rule.rule_id}</span>
                  <StatusBadge status={rule.citation_status} />
                  <StatusBadge status={rule.testability} />
                  {rule.requires_human_review && <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Review Required</span>}
                </div>
                <p className="mt-2 text-sm leading-relaxed">{rule.rule_text}</p>
                {rule.citation_text && <p className="mt-1 text-xs text-muted-foreground">Citation: {rule.citation_text}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {rule.governed_data_concepts.map((c) => (
                    <span key={c} className="rounded bg-muted px-2 py-0.5 text-xs">{c}</span>
                  ))}
                </div>
                {rule.extraction_warnings.length > 0 && (
                  <div className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-700">
                    Warnings: {rule.extraction_warnings.join('; ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
