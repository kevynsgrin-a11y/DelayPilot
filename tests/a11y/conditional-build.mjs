/**
 * A scratch build that emits `/accessibility/` and `/contact/`, so the axe sweep can reach them.
 *
 * Owner: qa-test-architect.
 *
 * WHY THIS IS A SEPARATE BUILD. Both routes are emitted only when `PUBLIC_CONTACT_EMAIL` is set
 * (`docs/BUILD_PLAN.md §10`, owner input I-3), because `DIRECTIVE.md §26` and `AGENTS.md §1.6`
 * refuse a placeholder address: a feedback route that reaches nobody is an accessibility barrier
 * dressed as a fix. Until the owner supplies a real address the routes are not in the normal build,
 * and the 88-run baseline in `docs/ACCESSIBILITY.md §15.3` is 80 runs over the served tree plus 8
 * over these two from a scratch build.
 *
 * THE ADDRESS USED HERE IS A SCRATCH ONE AND IS NEITHER REAL NOR LOGGED. `example.invalid` is a
 * reserved, permanently-unresolvable TLD (RFC 2606), so it cannot be delivered to and cannot be
 * mistaken for a person's address. The value is overridable with `DP_A11Y_CONTACT_EMAIL` for a run
 * that wants to exercise a different string; that value is never printed. `apps/web/dist` is never
 * touched — the output goes to a scratch directory outside the repository, because
 * `performance-engineer` measures the same `dist` in parallel.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { REPO_ROOT } from '../tools/serve-dist.mjs'

/** RFC 2606 reserved TLD. Not a real address, and never printed by this runner. */
const SCRATCH_CONTACT_EMAIL = 'a11y-harness@example.invalid'

/**
 * Build `apps/web` into a scratch `outDir` with the conditional routes enabled.
 *
 * @param {(line: string) => void} [log]
 * @returns {Promise<{ dist: string, cleanup: () => void }>}
 */
export async function buildConditionalRoutes(log = console.log) {
  const outDir = join(mkdtempSync(join(tmpdir(), 'delaypilot-a11y-')), 'dist')
  log(`  scratch build → ${outDir} (contact address: a reserved .invalid value, not logged)`)

  await new Promise((resolveRun, rejectRun) => {
    const child = spawn('pnpm', ['exec', 'astro', 'build', '--outDir', outDir, '--silent'], {
      cwd: resolve(REPO_ROOT, 'apps/web'),
      env: {
        ...process.env,
        PUBLIC_CONTACT_EMAIL: process.env['DP_A11Y_CONTACT_EMAIL'] ?? SCRATCH_CONTACT_EMAIL,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    /** @type {string[]} */
    const tail = []
    child.stdout.on('data', (chunk) => tail.push(String(chunk)))
    child.stderr.on('data', (chunk) => tail.push(String(chunk)))
    child.on('error', rejectRun)
    child.on('close', (code) => {
      if (code === 0) {
        const pages = /(\d+)\s+page\(s\)\s+built/.exec(tail.join(''))
        log(`  scratch build complete${pages === null ? '' : ` — ${pages[1]} page(s)`}`)
        resolveRun(undefined)
        return
      }
      rejectRun(
        new Error(
          `astro build for the conditional routes exited ${code}.\n${tail.join('').slice(-2000)}`,
        ),
      )
    })
  })

  return {
    dist: outDir,
    cleanup: () => {
      rmSync(dirname(outDir), { recursive: true, force: true })
    },
  }
}
