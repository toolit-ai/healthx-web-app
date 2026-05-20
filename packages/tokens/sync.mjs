// Copies packages/tokens/tokens.css to the docs repo so both surfaces share design tokens.
// Run from healthx-web-app root: `pnpm tokens:sync` (or `node packages/tokens/sync.mjs`).
//
// Assumes both repos are siblings on disk:
//   <parent>/healthx-web-app
//   <parent>/healthx-platform-kb
//
// In CI, the docs repo pulls tokens.css from a published @healthx/tokens package
// or fetches it from the web-app repo via repository_dispatch — see the corresponding workflow.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const source = resolve(here, 'tokens.css')

const targets = [
  resolve(here, '..', '..', 'src', 'ui', 'tokens.css'),
  resolve(here, '..', '..', '..', 'healthx-platform-kb', 'lib', 'tokens.css'),
]

const css = readFileSync(source, 'utf8')

for (const target of targets) {
  const dir = dirname(target)
  if (!existsSync(dir)) {
    if (target.includes('healthx-platform-kb')) {
      console.warn(`[tokens:sync] skip ${target} — sibling repo not found on disk`)
      continue
    }
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(target, css)
  console.log(`[tokens:sync] wrote ${target}`)
}
