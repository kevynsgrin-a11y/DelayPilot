/**
 * The Markdown-renderer corrections in `apps/web/src/lib/markdown/`.
 *
 * `prose-tables` does its structural work through Sätteri's arena-backed hast API, which cannot be
 * driven from a unit test without a compile — that half is measured on the built page instead
 * (`/passenger-rights/`: `th[scope="col"]` on the header row, five `th[scope="row"]`, and a
 * `role="region"` scroll container that is keyboard focusable at 320 CSS px).
 *
 * What IS a pure function is `nameProseTables`, the pass that gives each container its accessible
 * name after Sätteri's own `heading-ids` plugin has run. It is a rewrite of finished HTML, which is
 * exactly the kind of thing that works on the one document it was written against and silently
 * mangles the second one, so every shape it can meet is asserted here.
 */

import { describe, expect, it } from 'vitest'
import { nameProseTables } from '../src/lib/markdown/prose-tables.mjs'

const WRAPPER = '<div class="dp-table dpx-prose-table" tabindex="0">'
const TABLE = '<table><tbody><tr><th scope="row">a</th><td>b</td></tr></tbody></table></div>'

describe('nameProseTables', () => {
  it('names a container after the nearest preceding heading', () => {
    const out = nameProseTables(
      `<h2 id="the-five-statuses">The five statuses</h2>${WRAPPER}${TABLE}`,
    )
    expect(out).toContain('role="region"')
    expect(out).toContain('aria-labelledby="the-five-statuses"')
  })

  it('uses the NEAREST heading, not the first one on the page', () => {
    const out = nameProseTables(
      `<h2 id="first">One</h2><p>x</p><h3 id="second">Two</h3>${WRAPPER}${TABLE}`,
    )
    expect(out).toContain('aria-labelledby="second"')
    expect(out).not.toContain('aria-labelledby="first"')
  })

  it('names each of several containers after its own heading', () => {
    const out = nameProseTables(
      `<h2 id="one">One</h2>${WRAPPER}${TABLE}<h2 id="two">Two</h2>${WRAPPER}${TABLE}`,
    )
    expect(out).toContain('aria-labelledby="one"')
    expect(out).toContain('aria-labelledby="two"')
    expect(out.match(/role="region"/g)).toHaveLength(2)
  })

  it('leaves a container with no preceding heading focusable and unnamed', () => {
    // An unnamed region is a landmark a reader must visit to find out what it is, which is worse
    // than not offering one. `tabindex="0"` is the half that carries SC 2.1.1 and it stays.
    const out = nameProseTables(`${WRAPPER}${TABLE}`)
    expect(out).not.toContain('role="region"')
    expect(out).toContain('tabindex="0"')
  })

  it('ignores a heading that comes after the container', () => {
    const out = nameProseTables(`${WRAPPER}${TABLE}<h2 id="later">Later</h2>`)
    expect(out).not.toContain('aria-labelledby')
  })

  it('returns a document with no container untouched', () => {
    const html = '<h2 id="x">X</h2><p>No table here.</p>'
    expect(nameProseTables(html)).toBe(html)
  })

  it('keeps everything outside the container byte-identical', () => {
    const before = `<h2 id="x">X</h2><p>Before.</p>${WRAPPER}${TABLE}<p>After.</p>`
    const after = nameProseTables(before)
    expect(after).toContain('<p>Before.</p>')
    expect(after).toContain('<p>After.</p>')
    expect(after).toContain(TABLE)
    expect(after.length).toBeGreaterThan(before.length)
  })
})
