/**
 * prose-tables — make a Markdown table behave like every other table on this site.
 *
 * Owner: `frontend-ui-engineer`. Registered as an Astro integration in `apps/web/astro.config.mjs`,
 * so it runs over every entry in `apps/web/src/content/**` in both `astro dev` and `astro build`.
 *
 * It is a RENDERER, not an edit to the content. `content-editorial-lead` owns the article bodies,
 * and a table written in Markdown has no syntax for `scope`, for a row-header column, or for a
 * scroll container. Asking twenty authors to hand-write HTML tables in order to get accessible ones
 * is asking the wrong person for the wrong thing.
 *
 * `docs/ACCESSIBILITY.md` F31, measured on the rights-status table at `/passenger-rights/`:
 *
 *   · **No scroll container.** The table's min-content width contributed 18 px of PAGE-level
 *     horizontal scroll at a 320 CSS px viewport (SC 1.4.10), and, unlike every `DataTable`, it
 *     could not be scrolled from the keyboard at all (SC 2.1.1; Phase 9 B6 is the same finding one
 *     layer down, on the primitive).
 *   · **No `scope` on the header row.** A `<th>` with no `scope` leaves the header-to-cell
 *     association to a browser's heuristics instead of stating it (SC 1.3.1).
 *   · **A first column of `<td>` that is really the row header.** On that table the first column is
 *     the status name — `likely_applies`, `may_apply` — which is what every other cell in the row
 *     is about. `<th scope="row">` is what makes "may_apply, What it means, The facts we hold are
 *     consistent with the rule" the announcement rather than three unlabelled cells.
 *
 * ------------------------------------------------------------------------------------------------
 * WHY A SÄTTERI HAST PLUGIN, AND NOT `markdown.rehypePlugins`
 *
 * Astro 7.1.4's default Markdown processor is Sätteri, not unified. `markdown.rehypePlugins` still
 * exists but is deprecated AND throws unless `@astrojs/markdown-remark` is installed, which it no
 * longer is by default:
 *
 *     `markdown.rehypePlugins` … run on the `unified` processor from `@astrojs/markdown-remark`,
 *     which is no longer installed by default now that Sätteri is the default Markdown processor.
 *
 * Installing it — or `@astrojs/markdown-satteri`, to import `satteri()` and pass `hastPlugins` —
 * means a new dependency and a lockfile change in `apps/web/package.json`, which is not this pass's
 * to make. So the plugin registers the way Astro's own legacy shim registers one: by mutating
 * `config.markdown.processor.options` in `astro:config:setup`. `satteri()` creates `hastPlugins` as
 * a plain mutable array for exactly that, and Astro's `coerceLegacyMarkdownPlugins` does the same
 * thing to the unified equivalent.
 *
 * It FAILS CLOSED. If a future Astro changes the processor or the option shape, the hook throws
 * with the reason rather than silently rendering inaccessible tables for the rest of a release
 * (`AGENTS.md §1.5`).
 *
 * ------------------------------------------------------------------------------------------------
 * WHY THE NAME IS ADDED IN A RENDERER WRAPPER AND NOT IN THE PLUGIN
 *
 * `createSatteriMarkdownProcessor` appends its own `heading-ids` pass AFTER every user plugin, so
 * at the time a user plugin sees a table the preceding heading has no `id` yet. The available ways
 * to get one were: reproduce github-slugger's algorithm (a guess that silently diverges), or set
 * the id myself (which `heading-ids` then adopts as the slug, changing every anchor on the page).
 * Neither is acceptable for an attribute whose only job is to point at something real.
 *
 * So the structure is done in the plugin, and the ONE attribute that needs the id is added by
 * wrapping `processor.createRenderer`: `MarkdownRenderer.render` returns the finished HTML, in
 * which `heading-ids` has already run. The rewrite is a regex over markup this file emitted itself
 * — `<div class="dp-table dpx-prose-table" tabindex="0">` — not over arbitrary author HTML.
 *
 * ------------------------------------------------------------------------------------------------
 * WHAT IT DELIBERATELY DOES NOT DO: INVENT A `<caption>`
 *
 * F31 asks for one. A caption is visible prose describing the table, and there is no way to derive
 * it from the document without writing it: the nearest heading names the SECTION, not the table,
 * and "Table of statuses" is a sentence nobody wrote and nobody reviewed (`docs/VOICE.md §12`,
 * `AGENTS.md §1.1`). A handoff is filed to `content-editorial-lead` for the real captions. Until
 * one exists the container is named by reference to the nearest preceding heading, which is a fact
 * already on the page; when a caption lands it becomes the `aria-labelledby` target instead.
 */

/** The wrapper the hast plugin emits. The renderer wrapper matches on exactly this. */
const WRAPPER_OPEN = '<div class="dp-table dpx-prose-table" tabindex="0">'

const isElement = (node, tagName) =>
  node !== null &&
  typeof node === 'object' &&
  node.type === 'element' &&
  (tagName === undefined || node.tagName === tagName)

/** Read a hast property, tolerating the absent-properties case. */
const prop = (node, key) => node?.properties?.[key]

/**
 * True when `cell` is the first ELEMENT child of its row.
 *
 * `ctx.indexOf` counts every child including the newline text nodes a Markdown table emits between
 * `<tr>` and `<td>`, so the first cell is at index 1, not 0. Comparing against the first element
 * child is what the markup actually means, and it does not depend on how the source was formatted.
 */
function isFirstCell(cell, ctx) {
  const row = ctx.parent(cell)
  if (row === undefined) return false
  const children = row.children ?? []
  const firstIndex = children.findIndex((child) => isElement(child, 'td') || isElement(child, 'th'))
  // Identity comparison is not available: the API's own note says `parent.children.indexOf(node)`
  // will not find a visited node, so the two are positions in the same list, not the same objects.
  return firstIndex !== -1 && ctx.indexOf(cell) === firstIndex
}

/** The section element a row sits in (`thead` / `tbody` / `tfoot` / `table`). */
const sectionOf = (cell, ctx) => {
  const row = ctx.parent(cell)
  return row === undefined ? undefined : ctx.parent(row)
}

/**
 * The Sätteri hast plugin.
 *
 * Three narrow visitors rather than one walk of the table's subtree, so that every mutation is
 * applied to the node the visitor was handed — which is what the arena-backed API is built for. A
 * visitor that reached into a sibling's children would be patching nodes it was never given.
 */
export const proseTablesHastPlugin = {
  name: 'delaypilot-prose-tables',
  element: [
    {
      /* A header cell states its direction. In `thead` it heads a column; anywhere else, a row. */
      filter: ['th'],
      visit(node, ctx) {
        const inHead = isElement(sectionOf(node, ctx), 'thead')
        if (typeof prop(node, 'scope') !== 'string') {
          ctx.setProperty(node, 'scope', inHead ? 'col' : 'row')
        }
        ctx.setProperty(
          node,
          'class',
          inHead ? 'dp-table__head' : 'dp-table__cell dp-table__cell--row-header',
        )
      },
    },
    {
      /* The first cell of a body row is the row header: it is what the rest of the row is about. */
      filter: ['td'],
      visit(node, ctx) {
        if (isElement(sectionOf(node, ctx), 'thead') || !isFirstCell(node, ctx)) {
          ctx.setProperty(node, 'class', 'dp-table__cell')
          return
        }
        ctx.replaceNode(node, {
          ...node,
          tagName: 'th',
          properties: {
            ...(node.properties ?? {}),
            scope: 'row',
            class: 'dp-table__cell dp-table__cell--row-header',
          },
        })
      },
    },
    {
      /* The scroll container every DataTable already has. */
      filter: ['table'],
      visit(node, ctx) {
        const parent = ctx.parent(node)
        const parentClass = parent === undefined ? undefined : prop(parent, 'class')
        if (typeof parentClass === 'string' && parentClass.includes('dp-table')) return

        ctx.wrapNode(node, {
          type: 'element',
          tagName: 'div',
          properties: { class: 'dp-table dpx-prose-table', tabindex: '0' },
          children: [],
        })
      },
    },
  ],
}

/**
 * Name each prose-table container after the nearest heading before it, in the finished HTML.
 *
 * `role="region"` is applied ONLY when that reference resolves. An unnamed region is a landmark a
 * reader has to visit to discover what it is, which is worse than not offering one; `tabindex="0"`
 * carries SC 2.1.1 and the plugin applies it either way.
 *
 * @param {string} html the renderer's output, after Sätteri's `heading-ids` pass
 * @returns {string}
 */
export function nameProseTables(html) {
  if (!html.includes(WRAPPER_OPEN)) return html

  const heading = /<h[1-6]\b[^>]*\bid="([^"]+)"/gi
  let out = ''
  let cursor = 0
  let labelledBy

  for (let index = html.indexOf(WRAPPER_OPEN); index !== -1;) {
    heading.lastIndex = cursor
    for (let match = heading.exec(html); match !== null && match.index < index;) {
      labelledBy = match[1]
      match = heading.exec(html)
    }

    out += html.slice(cursor, index)
    out +=
      labelledBy === undefined
        ? WRAPPER_OPEN
        : `<div class="dp-table dpx-prose-table" tabindex="0" role="region" ` +
          `aria-labelledby="${labelledBy}">`

    cursor = index + WRAPPER_OPEN.length
    index = html.indexOf(WRAPPER_OPEN, cursor)
  }

  return out + html.slice(cursor)
}

/**
 * The Astro integration that registers both halves.
 *
 * @returns {import('astro').AstroIntegration}
 */
export function proseTables() {
  return {
    name: 'delaypilot:prose-tables',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        const processor = config.markdown?.processor
        const plugins = processor?.options?.hastPlugins

        if (!Array.isArray(plugins) || typeof processor.createRenderer !== 'function') {
          throw new Error(
            'delaypilot:prose-tables could not register: config.markdown.processor does not expose ' +
              "options.hastPlugins and createRenderer. Astro's Markdown processor has changed " +
              'shape, and every table in apps/web/src/content/** would ship without a scroll ' +
              'container, without scope on its headers and without a row-header column ' +
              '(docs/ACCESSIBILITY.md F31). Fix the registration rather than removing the check.',
          )
        }

        if (plugins.includes(proseTablesHastPlugin)) return
        plugins.push(proseTablesHastPlugin)

        /*
         * `updateConfig`, not an in-place assignment. Astro parses `markdown.processor` through a
         * `z.object`, which produces a NEW object each time: `options` survives (the schema uses
         * `z.custom` there precisely to preserve identity, which is why the plugin push above
         * works) but a `createRenderer` written onto the copy handed to this hook does not reach
         * the copy used at render time. Measured, not assumed — the first attempt pushed the
         * plugin successfully and silently dropped the wrapper.
         */
        const createRenderer = processor.createRenderer.bind(processor)
        updateConfig({
          markdown: {
            processor: {
              ...processor,
              createRenderer: async (shared) => {
                const renderer = await createRenderer(shared)
                const render = renderer.render.bind(renderer)
                return {
                  ...renderer,
                  render: async (content, opts) => {
                    const result = await render(content, opts)
                    return { ...result, code: nameProseTables(result.code) }
                  },
                }
              },
            },
          },
        })
      },
    },
  }
}

export default proseTables
