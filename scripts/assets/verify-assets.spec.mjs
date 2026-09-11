/**
 * `pnpm test` entry point for the brand-asset contract.
 *
 * Owner: visual-asset-director (docs/agents/ROSTER.md §3, `scripts/assets/**`).
 *
 * The checks themselves live in `verify-assets.mjs` so that the build, CI and a developer at a
 * terminal can run them without a test runner, and so the rule exists in exactly one place
 * (AGENTS.md §3.2). This file's only job is to surface each one as a named test, because a single
 * `expect(everything).toBe(true)` tells whoever broke it nothing about what they broke.
 *
 * Checks run once, at module load, and are then asserted individually: the maskable safe-zone
 * check decodes a 512 x 512 icon pixel by pixel, and doing that once per assertion would turn a
 * fast suite into a slow one.
 */

import { describe, expect, it } from 'vitest'

import { runChecks } from './verify-assets.mjs'

const results = await runChecks()

describe('brand assets', () => {
  it('runs a non-trivial number of checks', () => {
    // A guard against the suite silently passing because `runChecks` returned nothing — the
    // failure mode where a refactor makes every assertion vacuous.
    expect(results.length).toBeGreaterThan(100)
  })

  for (const result of results) {
    it(result.name, () => {
      expect(result.ok, result.detail || result.name).toBe(true)
    })
  }
})
