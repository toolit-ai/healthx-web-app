import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface ColumnDef {
  key: string
  header: string
  width?: string
}

interface DataTableProps {
  columns: ColumnDef[]
  data: Array<Record<string, string | number | undefined>>
  hideIndex?: boolean
  rowClassName?: string
}

export default function DataTable({ columns, data, hideIndex = false, rowClassName }: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const sortedData = useMemo(() => {
    if (!sortColumn) return data
    const dir = sortDirection === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const av = a[sortColumn]
      const bv = b[sortColumn]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir
    })
  }, [data, sortColumn, sortDirection])

  function handleSort(key: string) {
    if (sortColumn === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {!hideIndex && <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">#</th>}
            {columns.map((col) => (
              <th
                key={col.key}
                className="cursor-pointer px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:text-foreground"
                style={col.width ? { width: col.width } : undefined}
                onClick={() => handleSort(col.key)}
              >
                {col.header}
                {sortColumn === col.key && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedData.map((row, i) => (
            <tr key={i} className={cn('hover:bg-muted/50', rowClassName)}>
              {!hideIndex && <td className="px-3 py-2 text-xs text-muted-foreground">{i + 1}</td>}
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2">
                  {row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
          {sortedData.length === 0 && (
            <tr>
              <td colSpan={columns.length + (hideIndex ? 0 : 1)} className="px-3 py-6 text-center text-sm text-muted-foreground">
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
