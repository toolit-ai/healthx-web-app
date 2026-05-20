import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { route: '/', label: 'Home' },
  { route: '/run-setup', label: 'Run Setup' },
  { route: '/data-dq', label: 'Data & DQ' },
  { route: '/documents-rules', label: 'Documents & Rules' },
  { route: '/review-gates', label: 'Review Gates' },
  { route: '/findings', label: 'Findings' },
  { route: '/ask-documents', label: 'Ask Documents' },
  { route: '/reports', label: 'Reports' },
  { route: '/status', label: 'Status' },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-sm font-semibold tracking-tight">
            healthx
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.route}
                to={item.route}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  location.pathname === item.route
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="md:hidden overflow-x-auto border-t border-border">
          <div className="flex items-center gap-1 px-4 py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.route}
                to={item.route}
                className={cn(
                  'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  location.pathname === item.route
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <p className="text-xs text-muted-foreground">healthx · web app · v1.0.0</p>
          <p className="text-xs text-muted-foreground">Built by Rishabh Arya</p>
        </div>
      </footer>
    </div>
  )
}
