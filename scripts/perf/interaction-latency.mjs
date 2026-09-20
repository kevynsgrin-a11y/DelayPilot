#!/usr/bin/env node
/**
 * interaction-latency.mjs — measure the interaction half of Core Web Vitals.
 *
 * A Lighthouse load run never touches the page, so it reports no INP. Total Blocking Time is the
 * lab proxy the Lighthouse gate asserts; this script measures the real thing on the real controls.
 *
 *   node scripts/perf/interaction-latency.mjs               375x667, 4x CPU throttle
 *   node scripts/perf/interaction-latency.mjs --width 1440 --height 900 --cpu 1
 *   node scripts/perf/interaction-latency.mjs --dist <dir> --out <file>
 *
 * TWO NUMBERS, BECAUSE ONE OF THEM HAS A FLOOR
 * --------------------------------------------
 * 1. `inpMs` — the Event Timing API, observed as `PerformanceObserver({type: 'event'})` with
 *    entries grouped by `interactionId` and the maximum duration taken per interaction. This is
 *    the INP definition. Chrome clamps `durationThreshold` to a minimum of 16 ms, so an
 *    interaction faster than 16 ms produces NO entry. A null here is not a missing measurement: it
 *    is the measurement "this interaction did not reach the 16 ms observer floor", against a
 *    200 ms target.
 * 2. `eventToPaintMs` — measured directly, so there is a number even below that floor: a
 *    capture-phase listener records `event.timeStamp`, and the following `requestAnimationFrame`
 *    records `performance.now()`. The delta covers input delay, handler processing and the frame
 *    that presents the result. It is not the INP definition and is never reported as INP.
 *
 * WHAT IS EXERCISED. Every interactive control this build actually has. The site hydrates nothing,
 * so the list is short by construction and comes from the four external scripts: the mega-nav
 * disclosure, the mobile drawer, the theme control, and the lookup form's validation and combobox.
 * `.claude/agents/performance-engineer.md:139` names six cockpit interactions — choosing a
 * candidate, expanding a segment card, toggling monitoring, checking off a checklist item — and
 * those controls do not exist yet: `/app/**` is not built. They are recorded as not measured in
 * `docs/PERFORMANCE.md` rather than approximated with something else.
 */

/*
 * `document`, `window` and `requestAnimationFrame` below are not Node globals and are not meant to
 * be: they appear only inside functions that are serialised and evaluated IN THE PAGE by Playwright
 * (`page.addInitScript`, `page.evaluate`). ESLint lints this file as a Node module, which is
 * correct for everything else in it, so the page's globals are declared here rather than by
 * widening the project's ESLint configuration for a file that is 95% Node.
 */
/* global document, window, requestAnimationFrame */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { startDistServer } from './serve-dist.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..', '..')

function parseArgs(argv) {
  const out = {
    width: 375,
    height: 667,
    cpu: 4,
    port: 4630,
    dist: join(REPO, 'apps', 'web', 'dist'),
    out: join(REPO, 'lighthouse-report-interactions.json'),
    compress: 'auto',
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = () => argv[(i += 1)]
    if (arg === '--width') out.width = Number(next())
    else if (arg === '--height') out.height = Number(next())
    else if (arg === '--cpu') out.cpu = Number(next())
    else if (arg === '--port') out.port = Number(next())
    else if (arg === '--dist') out.dist = next()
    else if (arg === '--out') out.out = next()
    else if (arg === '--compress') out.compress = next()
    else {
      console.error(`interaction-latency: unknown option ${arg}`)
      process.exit(2)
    }
  }
  return out
}

/**
 * Installed before any document script runs, via the debugger rather than a <script> tag, so the
 * page's `script-src 'self'` Content-Security-Policy is neither violated nor relaxed to measure.
 */
const PROBE = () => {
  const state = { interactions: new Map(), pending: [] }
  window.__dpPerf = state
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const id = entry.interactionId
      if (!id) continue
      const previous = state.interactions.get(id) ?? 0
      state.interactions.set(id, Math.max(previous, entry.duration))
    }
  }).observe({ type: 'event', buffered: true, durationThreshold: 0 })
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      state.interactions.set(entry.interactionId || -1, entry.duration)
    }
  }).observe({ type: 'first-input', buffered: true })

  for (const type of [
    'pointerdown',
    'pointerup',
    'click',
    'keydown',
    'keyup',
    'change',
    'submit',
  ]) {
    document.addEventListener(
      type,
      (event) => {
        const stamp = event.timeStamp
        requestAnimationFrame(() => {
          const painted = performance.now()
          state.pending.push({ type, eventToPaintMs: painted - stamp })
        })
      },
      { capture: true },
    )
  }
}

async function measure(page, label, action) {
  await page.evaluate(() => {
    window.__dpPerf.interactions.clear()
    window.__dpPerf.pending.length = 0
  })
  await action()
  // Two animation frames plus a settle tick: the first frame presents, the second lets the Event
  // Timing entry be queued, and the timeout lets the observer callback run.
  await page.evaluate(
    () =>
      new Promise((done) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(done, 120)))
      }),
  )
  const result = await page.evaluate(() => ({
    interactions: [...window.__dpPerf.interactions.values()],
    pending: window.__dpPerf.pending.map((p) => ({ ...p })),
  }))
  const inpMs = result.interactions.length > 0 ? Math.max(...result.interactions) : null
  const eventToPaintMs =
    result.pending.length > 0
      ? Math.round(Math.max(...result.pending.map((p) => p.eventToPaintMs)) * 100) / 100
      : null
  return { label, inpMs, eventToPaintMs, eventsObserved: result.pending.length }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const server = await startDistServer({
    dist: resolve(args.dist),
    port: args.port,
    compress: args.compress,
  })
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: args.width, height: args.height },
    deviceScaleFactor: args.width <= 768 ? 2 : 1,
    isMobile: false,
    hasTouch: args.width <= 768,
  })
  const page = await context.newPage()
  await page.addInitScript(PROBE)
  const cdp = await context.newCDPSession(page)
  if (args.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: args.cpu })

  const measurements = []
  try {
    await page.goto(`${server.origin}/`, { waitUntil: 'load' })
    await page.waitForTimeout(400)

    const narrow = args.width <= 768

    if (narrow) {
      measurements.push(
        await measure(page, 'open the mobile navigation drawer', async () => {
          await page.click('[data-dp-drawer-open]')
        }),
      )
      measurements.push(
        await measure(page, 'choose the dark theme (drawer control)', async () => {
          await page.click('input[name="dp-theme-drawer"][value="dark"]', { force: true })
        }),
      )
      measurements.push(
        await measure(page, 'close the mobile navigation drawer', async () => {
          await page.click('[data-dp-drawer-close]')
        }),
      )
    } else {
      measurements.push(
        await measure(page, 'open a mega-nav disclosure', async () => {
          await page.click('[data-dp-menu-trigger]')
        }),
      )
      measurements.push(
        await measure(page, 'close the mega-nav disclosure', async () => {
          await page.keyboard.press('Escape')
        }),
      )
      measurements.push(
        await measure(page, 'choose the dark theme (header control)', async () => {
          await page.click('input[name="dp-theme-header"][value="dark"]', { force: true })
        }),
      )
    }

    measurements.push(
      await measure(page, 'submit the lookup with nothing entered (validation path)', async () => {
        await page.click('form[data-dp-lookup] button[type="submit"]')
      }),
    )
    measurements.push(
      await measure(page, 'type a letter into the airline combobox', async () => {
        await page.click('input[data-dp-field="airline"]')
        await page.keyboard.type('b', { delay: 0 })
      }),
    )
    measurements.push(
      await measure(page, 'type a flight number', async () => {
        await page.click('input[data-dp-field="flightNumber"]')
        await page.keyboard.type('421', { delay: 0 })
      }),
    )
    measurements.push(
      await measure(page, 'submit the lookup with a flight number entered', async () => {
        await page.click('form[data-dp-lookup] button[type="submit"]')
      }),
    )
  } finally {
    await browser.close()
    await server.close()
  }

  const observed = measurements.filter((m) => m.inpMs !== null)
  const report = {
    generatedAt: new Date().toISOString(),
    dist: resolve(args.dist),
    viewport: `${args.width}x${args.height}`,
    cpuThrottlingRate: args.cpu,
    compression: args.compress,
    target: { inpMs: 200, source: 'DIRECTIVE.md §22' },
    observerFloorMs: 16,
    measurements,
    worstInpMs: observed.length > 0 ? Math.max(...observed.map((m) => m.inpMs)) : null,
    worstEventToPaintMs: Math.max(...measurements.map((m) => m.eventToPaintMs ?? 0)),
  }
  mkdirSync(dirname(resolve(args.out)), { recursive: true })
  writeFileSync(resolve(args.out), JSON.stringify(report, null, 2) + '\n')

  console.log(
    `Interaction latency — ${report.viewport}, CPU x${args.cpu}, compression ${args.compress}\n`,
  )
  const width = Math.max(...measurements.map((m) => m.label.length))
  for (const m of measurements) {
    console.log(
      `  ${m.label.padEnd(width)}  INP ${m.inpMs === null ? '  under the 16 ms observer floor' : `${String(m.inpMs).padStart(4)} ms`}` +
        `   event-to-paint ${String(m.eventToPaintMs ?? '—').padStart(7)} ms`,
    )
  }
  console.log(
    `\n  worst INP: ${report.worstInpMs === null ? 'no interaction reached the 16 ms Event Timing floor' : report.worstInpMs + ' ms'}` +
      `   worst event-to-paint: ${report.worstEventToPaintMs} ms   target: INP < 200 ms`,
  )
  console.log(`  JSON report: ${resolve(args.out)}`)

  if (report.worstInpMs !== null && report.worstInpMs >= report.target.inpMs) {
    console.error(
      `\nINP ${report.worstInpMs} ms is at or above the ${report.target.inpMs} ms target (DIRECTIVE.md §22). Owner: frontend-ui-engineer.`,
    )
    process.exit(1)
  }
  process.exit(0)
}

await main()
