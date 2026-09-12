/**
 * The article source block, and the one part of it nothing else exercises.
 *
 * `sources`, `internalRefs` and the null-verification-date line all render on every served guide
 * and explainer, so `pnpm build` walks them. `contextSources` does not: the three entries that
 * carry one — the two EU guides and the EU explainer — are still in `source_review`, so no route is
 * emitted for them and the whole context branch of `ArticleLayout.astro` is unreachable from the
 * built site. An unreachable branch is where a regression sits for months, and this one is not
 * cosmetic: `DIRECTIVE.md §3.5` says a news summary never outranks the regulator, and the block's
 * entire job is to keep a press release from being read as an authority.
 *
 * WHAT IS ASSERTED AGAINST DATA, AND WHAT IS ASSERTED AGAINST SOURCE. The registry check and the
 * resolver check run against the real registry and the real frontmatter. The schema and template
 * checks read source text, because neither is importable here: `content.config.ts` imports the
 * `astro:content` virtual module, which exists only inside an Astro build, and `.astro` files have
 * no transform in this runner (there is no Vitest config in this repository, and adding one belongs
 * to `qa-test-architect`). They are written as narrow anchors on the exact expression that matters
 * rather than as a shape test, so they fail on a deletion and not on a reformat.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { resolveContextSources, resolveSource } from '../src/components/source-registry.ts'
import { pages } from '../src/lib/copy/pages.ts'

const repoFile = (path: string): string =>
  readFileSync(fileURLToPath(new URL(`../../../${path}`, import.meta.url)), 'utf8')

interface RegistryRecord {
  readonly id: string
  readonly citableForRuleValues: boolean
}

const registry = JSON.parse(repoFile('data/rights/sources/registry.json')) as {
  readonly sources: readonly RegistryRecord[]
}
const citableById = new Map(registry.sources.map((record) => [record.id, record]))

/**
 * The frontmatter list under `key`, as written.
 *
 * A four-line reader rather than a YAML dependency: the shape it has to understand is a key on its
 * own line followed by `  - value` items, which is how every entry in the collection is written.
 */
function frontmatterList(frontmatter: string, key: string): readonly string[] {
  const lines = frontmatter.split('\n')
  const start = lines.findIndex((line) => line.trimEnd() === `${key}:`)
  if (start === -1) return []
  const values: string[] = []
  for (const line of lines.slice(start + 1)) {
    const match = /^\s+-\s+(.+?)\s*$/.exec(line)
    if (match?.[1] === undefined) break
    values.push(match[1].replace(/^['"]|['"]$/g, ''))
  }
  return values
}

interface Entry {
  readonly file: string
  readonly sources: readonly string[]
  readonly contextSources: readonly string[]
}

const entries: readonly Entry[] = ['guides', 'passenger-rights'].flatMap((collection) => {
  const directory = `apps/web/src/content/${collection}`
  return readdirSync(fileURLToPath(new URL(`../../../${directory}`, import.meta.url)))
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const frontmatter = repoFile(`${directory}/${name}`).split('---')[1] ?? ''
      return {
        file: `${collection}/${name}`,
        sources: frontmatterList(frontmatter, 'sources'),
        contextSources: frontmatterList(frontmatter, 'contextSources'),
      }
    })
})

const withContext = entries.filter((entry) => entry.contextSources.length > 0)

describe('contextSources — the data behind the block', () => {
  it('is used by at least one entry, so the branch is not dead code', () => {
    expect(entries.length).toBeGreaterThan(0)
    expect(withContext.length).toBeGreaterThan(0)
  })

  it('names only registry records that may NOT be cited for a rule value', () => {
    // This is the whole reason the block is separate. A record with `citableForRuleValues: true`
    // listed as context would be understating a regulator; a record with `false` listed under
    // `sources` would be the overclaim DIRECTIVE.md §3.5 forbids. The first half is checked here;
    // the second half cannot be, because an operational data feed (`awc-data-api`) is legitimately
    // a source for a guide about METAR terms while never being citable for a rule VALUE.
    for (const entry of withContext) {
      for (const id of entry.contextSources) {
        const record = citableById.get(id)
        expect(record, `${entry.file} cites unknown registry id "${id}" as context`).toBeDefined()
        expect(record?.citableForRuleValues, `${entry.file}: ${id}`).toBe(false)
      }
    }
  })

  it('never lists the same record as both an authority and context on one page', () => {
    for (const entry of withContext) {
      for (const id of entry.contextSources) {
        expect(entry.sources, `${entry.file}: ${id} is in both lists`).not.toContain(id)
      }
    }
  })

  it('resolves every context id to an authority name, never a bare slug', () => {
    for (const entry of withContext) {
      for (const resolved of resolveContextSources(entry.contextSources)) {
        expect(resolved.missing, `${entry.file}: ${resolved.id}`).toBe(false)
        expect(resolved.label).not.toBe(resolved.id)
        expect(resolved.address?.length ?? 0).toBeGreaterThan(0)
      }
    }
  })

  it('gives a context source no href at all, so the template cannot link one', () => {
    const [first] = resolveContextSources(withContext[0]?.contextSources ?? [])
    expect(first).toBeDefined()
    expect(Object.hasOwn(first ?? {}, 'href')).toBe(false)
    // The same record through the source resolver DOES carry the field, which is what makes the
    // omission above a decision rather than an accident of the current registry.
    expect(Object.hasOwn(resolveSource(withContext[0]?.contextSources[0] ?? ''), 'href')).toBe(true)
  })
})

describe('contextSources — the schema and the template', () => {
  const config = repoFile('apps/web/src/content.config.ts')
  const layout = repoFile('apps/web/src/layouts/ArticleLayout.astro')

  it('is optional on the shared base object, so BOTH collections accept it', () => {
    expect(config).toContain('contextSources: z.array(z.string()).optional()')
    // One `base`, refined for guides and extended for passenger rights: the field cannot be present
    // on one collection and missing from the other.
    expect(config).toContain('const cited = base.refine(')
    expect(config).toContain('schema: cited')
    expect(config).toContain('schema: base')
    expect(config).toContain('.extend({ jurisdiction: z.enum(jurisdictions) })')
  })

  it('renders the block under its own heading, with the intro and a note on every item', () => {
    expect(layout).toContain('resolveContextSources(contextSources ?? [])')
    expect(layout).toContain('{pages.article.contextHeading}')
    expect(layout).toContain('{pages.article.contextIntro}')
    expect(layout).toContain('{pages.article.contextNote}')
    // Rendered apart from `sources`, never merged into that list.
    expect(layout).toContain('{pages.article.sourcesHeading}')
    expect(pages.article.contextHeading).not.toBe(pages.article.sourcesHeading)
  })

  it('renders a null verification date as words and keeps internal refs out of Sources', () => {
    // Rendered where the date would be, as the null branch of the ternary.
    expect(layout).toContain('source.lastVerifiedAt === null')
    expect(layout).toContain('? pages.article.notYetVerified')
    expect(layout).toContain('{pages.article.internalRefsHeading}')
    expect(pages.article.internalRefsHeading).not.toBe(pages.article.sourcesHeading)
  })
})
