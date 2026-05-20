import { useState, useMemo } from 'react'

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
    <div style={{ overflowX: 'auto' }}>
      <table className="hx">
        <thead>
          <tr>
            {!hideIndex && <th>#</th>}
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width, cursor: 'pointer' } : { cursor: 'pointer' }}
                onClick={() => handleSort(col.key)}
              >
                {col.header}
                {sortColumn === col.key && (
                  <span style={{ marginLeft: 4 }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => (
            <tr key={i} className={rowClassName}>
              {!hideIndex && (
                <td className="num" style={{ color: 'var(--ink-mute)', fontSize: 11 }}>
                  {i + 1}
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className={typeof row[col.key] === 'number' ? 'num' : ''}>
                  {row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
          {sortedData.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (hideIndex ? 0 : 1)}
                style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--ink-mute)' }}
              >
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
