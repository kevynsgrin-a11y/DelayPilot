#!/usr/bin/env node
/**
 * Validates the DelayPilot subagent build system.
 *
 * 1. Charter structure — every .claude/agents/*.md has well-formed frontmatter and the
 *    mandatory section order from docs/agents/CHARTER_TEMPLATE.md.
 * 2. Ownership integrity — no path in docs/agents/ROSTER.md §3 is claimed by two charters,
 *    and every charter's "You own" paths trace back to the roster.
 * 3. Overclaim lint — no legal/statistical overclaim phrase appears in project prose.
 *
 * Owner: build-orchestrator. Runs in CI. Exit code 1 on any error.
 *
 * Usage: node scripts/validate-build-system.mjs
 */

import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = path.resolve(import.meta.dirname, '..')
const AGENTS_DIR = path.join(ROOT, '.claude', 'agents')

const REQUIRED_FRONTMATTER = ['name', 'description', 'tools', 'model']
const REQUIRED_SECTIONS = [
  '## Mission',
  '## You own',
  '## You must not',
  '## Inputs you consume',
  '## Deliverables',
  '## How to work',
  '## Definition of done',
  '## Verification',
  '## Handoffs',
]

const MIN_LINES = 60
const MAX_LINES = 260

/**
 * Phrases that must never appear as product prose. AGENTS.md and DIRECTIVE.md define these
 * bans and therefore quote them; charters legitimately quote them inside "You must not".
 * Everything else in the repository is scanned.
 */
const OVERCLAIM_PHRASES = [
  'guaranteed compensation',
  'guaranteed connection',
  'legally entitled',
  'you are owed',
  'approved claim',
  'we will win your',
  'the airline must pay',
  'your flight will be canceled',
  'your flight will be cancelled',
  'ai-powered flight',
]

/** Files whose job is to define or quote the bans. */
const OVERCLAIM_ALLOWLIST = new Set([
  'AGENTS.md',
  'DIRECTIVE.md',
  'docs/agents/CHARTER_TEMPLATE.md',
  'scripts/validate-build-system.mjs',
])

const errors = []
const warnings = []

const err = (file, msg) => errors.push(`${file}: ${msg}`)
const warn = (file, msg) => warnings.push(`${file}: ${msg}`)

/** Minimal frontmatter reader — key order matters, so parse as an ordered list. */
function parseFrontmatter(source) {
  if (!source.startsWith('---\n')) return null
  const end = source.indexOf('\n---', 4)
  if (end === -1) return null
  const block = source.slice(4, end)
  const keys = []
  const values = {}
  for (const line of block.split('\n')) {
    const match = /^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/.exec(line)
    if (!match) continue
    const [, key, value] = match
    keys.push(key)
    values[key] = value.trim()
  }
  return { keys, values, body: source.slice(end + 4) }
}

async function validateCharters() {
  if (!existsSync(AGENTS_DIR)) {
    err('.claude/agents', 'directory is missing — the build system has no agents')
    return []
  }

  const files = (await readdir(AGENTS_DIR)).filter((f) => f.endsWith('.md')).sort()
  if (files.length === 0) {
    err('.claude/agents', 'no charter files found')
    return []
  }

  const charters = []

  for (const file of files) {
    const rel = `.claude/agents/${file}`
    const source = await readFile(path.join(AGENTS_DIR, file), 'utf8')
    const fm = parseFrontmatter(source)

    if (!fm) {
      err(rel, 'missing or malformed YAML frontmatter')
      continue
    }

    const required = fm.keys.filter((k) => REQUIRED_FRONTMATTER.includes(k))
    for (const key of REQUIRED_FRONTMATTER) {
      if (!fm.keys.includes(key)) err(rel, `frontmatter missing "${key}"`)
    }
    if (required.join(',') !== REQUIRED_FRONTMATTER.filter((k) => fm.keys.includes(k)).join(',')) {
      err(rel, `frontmatter key order must be ${REQUIRED_FRONTMATTER.join(', ')}`)
    }

    const expectedName = file.replace(/\.md$/, '')
    if (fm.values.name !== expectedName) {
      err(rel, `frontmatter name "${fm.values.name}" does not match filename "${expectedName}"`)
    }
    if (!/^Use this agent when/i.test(fm.values.description ?? '')) {
      err(rel, 'description must start with "Use this agent when"')
    }
    if ((fm.values.description ?? '').includes('\n')) {
      err(rel, 'description must be a single line')
    }

    let cursor = -1
    for (const section of REQUIRED_SECTIONS) {
      const index = fm.body.indexOf(`\n${section}`)
      if (index === -1) {
        err(rel, `missing required section "${section}"`)
        continue
      }
      if (index < cursor) err(rel, `section "${section}" is out of order`)
      cursor = index
    }

    const lineCount = source.split('\n').length
    if (lineCount < MIN_LINES) warn(rel, `only ${lineCount} lines — likely under-specified`)
    if (lineCount > MAX_LINES) warn(rel, `${lineCount} lines — likely padded`)

    // Ownership claims are the bullet list only. Charters often close the section with prose
    // pointing at *other* agents' paths ("`packages/contracts/**` belongs to principal-architect");
    // that is a disclaimer, not a claim, so only list items count.
    const ownSection = /\n## You own\n([\s\S]*?)\n## /.exec(fm.body)?.[1] ?? ''
    const ownedPaths = ownSection
      .split('\n')
      .filter((line) => /^\s*[-*]\s/.test(line))
      .flatMap((line) => [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]))
      .filter((p) => p.includes('/') || p.endsWith('.md') || p.endsWith('.txt'))

    if (ownedPaths.length === 0) warn(rel, '"You own" lists no backticked paths')

    charters.push({ file: rel, name: expectedName, ownedPaths, tools: fm.values.tools ?? '' })
  }

  // Ownership collisions: the property that makes parallel dispatch safe.
  const claims = new Map()
  for (const charter of charters) {
    for (const p of charter.ownedPaths) {
      const normalized = p.replace(/\*+$/, '').replace(/\/+$/, '')
      if (!normalized) continue
      if (!claims.has(normalized)) claims.set(normalized, [])
      claims.get(normalized).push(charter.name)
    }
  }
  for (const [p, owners] of claims) {
    const unique = [...new Set(owners)]
    if (unique.length > 1) {
      err('ownership', `path "${p}" is claimed by ${unique.length} agents: ${unique.join(', ')}`)
    }
  }

  return charters
}

async function walk(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', '.astro', 'artifacts'].includes(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, acc)
    else acc.push(full)
  }
  return acc
}

async function lintOverclaims() {
  const files = (await walk(ROOT)).filter((f) =>
    /\.(md|mdx|ts|tsx|js|mjs|astro|json|html)$/.test(f),
  )
  // A banned phrase may legitimately be quoted in order to forbid it — policy docs and charters
  // enumerate the ban list, and "## You must not" sections quote the exact strings they reject.
  // So the unit of judgement is the enclosing paragraph plus its nearest heading, not the line:
  // a phrase inside prohibiting context is a citation, anywhere else it is an assertion.
  //
  // This is deliberately the *build-system* lint. The product-facing lint over apps/** is owned by
  // ux-copy-steward (Phase 10) and is stricter, because rendered copy has no legitimate reason to
  // contain these strings at all.
  const PROHIBITING =
    /\b(never|not|forbid\w*|do not|don't|avoid|ban|banned|blocklist|denylist|disallow\w*|must not|prohibit\w*|overclaim\w*|reject\w*|violation|instead of|rather than|sweep|grep|lint)\b/i

  for (const full of files) {
    const rel = path.relative(ROOT, full)
    if (OVERCLAIM_ALLOWLIST.has(rel)) continue
    const source = await readFile(full, 'utf8')
    const lines = source.split('\n')

    // Paragraph index per line (blank-line delimited) and the nearest preceding heading.
    const paragraphOf = []
    const headingOf = []
    let paragraph = 0
    let heading = ''
    lines.forEach((line) => {
      if (line.trim() === '') paragraph += 1
      if (/^#{1,6}\s/.test(line)) {
        heading = line
        paragraph += 1
      }
      paragraphOf.push(paragraph)
      headingOf.push(heading)
    })
    const paragraphText = new Map()
    lines.forEach((line, i) => {
      const key = paragraphOf[i]
      paragraphText.set(key, `${paragraphText.get(key) ?? ''}\n${line}`)
    })

    lines.forEach((line, i) => {
      const lower = line.toLowerCase()
      for (const phrase of OVERCLAIM_PHRASES) {
        if (!lower.includes(phrase)) continue
        const context = `${headingOf[i]}\n${paragraphText.get(paragraphOf[i]) ?? line}`
        if (PROHIBITING.test(context)) continue
        err(rel, `line ${i + 1}: overclaim phrase "${phrase}"`)
      }
    })
  }
}

const charters = await validateCharters()
await lintOverclaims()

console.log(`Charters validated: ${charters.length}`)
if (charters.length) {
  console.log(`Agents: ${charters.map((c) => c.name).join(', ')}`)
}

for (const w of warnings) console.log(`WARN  ${w}`)
for (const e of errors) console.error(`ERROR ${e}`)

console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`)
process.exit(errors.length > 0 ? 1 : 0)
