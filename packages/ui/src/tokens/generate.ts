/**
 * Token build.
 *
 *   pnpm --filter @delaypilot/ui tokens:build
 *
 * Writes the two generated artifacts and nothing else:
 *   - apps/web/src/styles/tokens.css        the shipped stylesheet
 *   - packages/ui/src/tokens/CONTRAST.md    the committed measured table
 *
 * Runs on Node's native TypeScript type stripping, so it has no build step of its own. Both outputs
 * are deterministic; packages/ui/test/tokens.test.ts regenerates them in memory and asserts
 * byte-equality with what is committed.
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

import { renderTokensCss } from './css.ts'
import { renderContrastTable } from './contrast-table.ts'
import { contrastPairs, measureAllPairs, themeNames, tightestPair } from './pairs.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..', '..')

export const STYLESHEET_PATH = join(repoRoot, 'apps', 'web', 'src', 'styles', 'tokens.css')
export const CONTRAST_TABLE_PATH = join(here, 'CONTRAST.md')

function main(): void {
  const measurements = measureAllPairs()
  const failures = measurements.filter((measurement) => !measurement.pass)
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(
        `  - ${failure.theme}: --${failure.pair.foreground} (${failure.foregroundHex}) on ` +
          `--${failure.pair.background} (${failure.backgroundHex}) is ${failure.ratio.toFixed(2)}:1, ` +
          `below ${String(failure.threshold)}:1.`,
      )
    }
    throw new Error(
      `${String(failures.length)} failing contrast pair(s). Extend the ramp in primitive.ts — never lower the floor.`,
    )
  }

  writeFileSync(STYLESHEET_PATH, renderTokensCss(), 'utf8')
  writeFileSync(CONTRAST_TABLE_PATH, renderContrastTable(), 'utf8')

  console.log(`Wrote ${relative(repoRoot, STYLESHEET_PATH)}`)
  console.log(`Wrote ${relative(repoRoot, CONTRAST_TABLE_PATH)}`)
  console.log(
    `${String(contrastPairs.length)} registered pairs x 2 themes = ${String(measurements.length)} measurements, 0 failing, 0 unmeasured.`,
  )
  for (const theme of themeNames) {
    const worst = tightestPair(measurements, theme)
    console.log(
      `Tightest ${theme}: --${worst.pair.foreground} on --${worst.pair.background} at ` +
        `${worst.ratio.toFixed(2)}:1 (floor ${String(worst.threshold)}:1).`,
    )
  }
}

main()
