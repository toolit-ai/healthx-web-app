interface NotReadyStateProps {
  reason: string
  prerequisite: string
}

export default function NotReadyState({ reason, prerequisite }: NotReadyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-10 text-center" role="status">
      <p className="text-2xl text-muted-foreground">...</p>
      <p className="mt-3 text-sm font-medium text-foreground">{reason}</p>
      <p className="mt-1 text-xs text-muted-foreground">{prerequisite}</p>
    </div>
  )
}
