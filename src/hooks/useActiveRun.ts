import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'hx_active_run_id'
const CHANGE_EVENT = 'hx:active-run-changed'

function readFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  const queryStart = hash.indexOf('?')
  if (queryStart === -1) return null
  const params = new URLSearchParams(hash.slice(queryStart + 1))
  return params.get('runId')
}

function readInitial(): string | null {
  const fromUrl = readFromUrl()
  if (fromUrl) return fromUrl
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(STORAGE_KEY)
}

function broadcast(newValue: string | null) {
  window.dispatchEvent(
    new CustomEvent<string | null>(CHANGE_EVENT, { detail: newValue }),
  )
}

export function useActiveRun() {
  const [runId, setRunIdState] = useState<string | null>(() => readInitial())

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setRunIdState(e.newValue)
    }
    function onChange(e: Event) {
      setRunIdState((e as CustomEvent<string | null>).detail)
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(CHANGE_EVENT, onChange)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(CHANGE_EVENT, onChange)
    }
  }, [])

  const setRunId = useCallback((id: string) => {
    window.localStorage.setItem(STORAGE_KEY, id)
    setRunIdState(id)
    broadcast(id)
  }, [])

  const clearRunId = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setRunIdState(null)
    broadcast(null)
  }, [])

  return { runId, setRunId, clearRunId }
}
