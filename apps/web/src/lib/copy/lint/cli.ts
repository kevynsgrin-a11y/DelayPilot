#!/usr/bin/env node
/**
 * Forbidden-phrase lint, command line entry. Owner: `ux-copy-steward`.
 *
 * Runs on Node's native TypeScript stripping (Node 22.18 and later strip types with no flag; on
 * earlier 22.x use `--experimental-strip-types`):
 *
 *   node apps/web/src/lib/copy/lint/cli.ts
 *
 * Options
 *   --root <dir>      repository root to scan (default: the repository this file lives in)
 *   --only <dir>      scan just this path under the root, repeatable — for porting reference code
 *   --no-allowlist    scan the four allowlisted definition files too
 *   --fail-fast       stop at the first file that has a hit
 *   --json            machine-readable output
 *
 * Exit code is 1 if any hit survives the allowlist, 0 otherwise. There is no auto-fix and there
 * will not be one: the fix for an overclaim is a rewrite by someone who knows what the sentence was
 * for, and a tool that silently rewords legal copy is worse than the problem it solves.
 */

import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { scanRepository, scanRoots, allowlist, type Hit } from './scan.ts'

const DEFAULT_ROOT = fileURLToPath(new URL('../../../../../../', import.meta.url))

interface Options {
  root: string
  roots: string[]
  useAllowlist: boolean
  failFast: boolean
  json: boolean
}

function parseArguments(argv: readonly string[]): Options {
  const options: Options = {
    root: DEFAULT_ROOT,
    roots: [],
    useAllowlist: true,
    failFast: false,
    json: false,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const argument = argv[i] ?? ''
    if (argument === '--root') {
      options.root = argv[i + 1] ?? options.root
      i += 1
    } else if (argument === '--only') {
      const value = argv[i + 1]
      if (value !== undefined) options.roots.push(value)
      i += 1
    } else if (argument === '--no-allowlist') {
      options.useAllowlist = false
    } else if (argument === '--fail-fast') {
      options.failFast = true
    } else if (argument === '--json') {
      options.json = true
    } else if (argument === '--help' || argument === '-h') {
      process.stdout.write(usage())
      process.exit(0)
    } else {
      process.stderr.write(`forbidden-phrases: unknown option "${argument}"\n${usage()}`)
      process.exit(2)
    }
  }
  return options
}

function usage(): string {
  return [
    'Usage: node apps/web/src/lib/copy/lint/cli.ts [options]',
    '  --root <dir>      repository root to scan',
    '  --only <dir>      scan just this path under the root (repeatable)',
    '  --no-allowlist    scan the allowlisted definition files too',
    '  --fail-fast       stop at the first file that has a hit',
    '  --json            machine-readable output',
    '',
  ].join('\n')
}

/** One line per hit: path, line, column, phrase, invariant. */
function formatHit(hit: Hit): string {
  return `${hit.file}:${String(hit.line)}:${String(hit.column)}  ${hit.phrase}  [${hit.invariant}]`
}

const options = parseArguments(process.argv.slice(2))
const result = scanRepository({
  root: options.root,
  ...(options.roots.length > 0 ? { roots: options.roots } : {}),
  ...(options.useAllowlist ? {} : { allowlist: [] }),
  failFast: options.failFast,
})

if (options.json) {
  process.stdout.write(`${JSON.stringify({ ...result, hits: [...result.hits] }, null, 2)}\n`)
} else {
  for (const hit of result.hits) {
    process.stdout.write(`${formatHit(hit)}\n`)
    process.stdout.write(`    matched: ${JSON.stringify(hit.matched)}  —  ${hit.why}\n`)
    if (hit.excerpt !== '') process.stdout.write(`    line:    ${hit.excerpt}\n`)
  }

  const files = new Set(result.hits.map((hit) => hit.file)).size
  const roots = options.roots.length > 0 ? options.roots.join(', ') : scanRoots.join(', ')
  process.stdout.write(
    `\nforbidden-phrases: ${String(result.scanned)} files scanned under [${roots}], ` +
      `${String(result.skipped)} skipped, ${String(result.hits.length)} hit(s) in ` +
      `${String(files)} file(s).\n`,
  )
  if (options.useAllowlist) {
    process.stdout.write(
      `allowlist (${String(allowlist.length)} entries, closed): ` +
        `${allowlist.map((entry) => entry.path).join(', ')}\n`,
    )
  }
}

process.exit(result.hits.length > 0 ? 1 : 0)
