/**
 * Primitive contracts.
 *
 * Rendered with `react-dom/server` and asserted on markup: roles, ARIA wiring, required accessible
 * names, tabular figures, table semantics, reserved dimensions. No DOM environment is installed at
 * the repository test runner, so behaviour that needs one — focus restoration, the Tab cycle inside
 * a Dialog — is verified by accessibility-lead's Phase 12 suite (`pnpm test:a11y`) rather than
 * asserted falsely here.
 *
 * What this file does cover is the part that is a design-system contract rather than a browser
 * behaviour: that a status can never ship without a shape and a label, that there are exactly six
 * provenance chips with the exact `AGENTS.md §1.2` labels, and that nothing renders a blank where a
 * designed state belongs.
 *
 * It also enforces the Content-Security-Policy contract. `apps/web/public/_headers` serves
 * `style-src 'self'` with no `'unsafe-inline'`, which governs the `style` ATTRIBUTE as well as the
 * `<style>` element, and an attribute cannot be allowed by hash because its value changes per
 * render. Every `style={{…}}` a primitive emitted was therefore a declaration the browser discards:
 * the ProgressBar fill rendered EMPTY at every reading, Stack gaps collapsed to zero, and Skeleton
 * and AdSlot reserved no space at all — the CLS defect those two exist to prevent. The last
 * describe in this file renders every primitive across every documented prop value and requires the
 * string `style=` to be absent.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement, type ReactElement } from 'react'

import { AdSlot, adSlotSizes } from '../src/primitives/AdSlot.tsx'
import { Badge } from '../src/primitives/Badge.tsx'
import { Button } from '../src/primitives/Button.tsx'
import { Callout } from '../src/primitives/Callout.tsx'
import { Card } from '../src/primitives/Card.tsx'
import { Checkbox } from '../src/primitives/Checkbox.tsx'
import { Combobox, ComboboxListbox, ComboboxOption } from '../src/primitives/Combobox.tsx'
import { DataTable } from '../src/primitives/DataTable.tsx'
import { Dialog } from '../src/primitives/Dialog.tsx'
import { Disclosure } from '../src/primitives/Disclosure.tsx'
import { Drawer } from '../src/primitives/Drawer.tsx'
import { Field } from '../src/primitives/Field.tsx'
import { Grid, GridArea } from '../src/primitives/Grid.tsx'
import { Icon, iconNames, type IconName } from '../src/primitives/Icon.tsx'
import { Input } from '../src/primitives/Input.tsx'
import { Link } from '../src/primitives/Link.tsx'
import { ProgressBar } from '../src/primitives/ProgressBar.tsx'
import { ProvenanceChip } from '../src/primitives/ProvenanceChip.tsx'
import { Radio } from '../src/primitives/Radio.tsx'
import { Select } from '../src/primitives/Select.tsx'
import { Skeleton, skeletonVariants, type SkeletonVariant } from '../src/primitives/Skeleton.tsx'
import { Stack, type SpaceStep } from '../src/primitives/Stack.tsx'
import { StatusPill } from '../src/primitives/StatusPill.tsx'
import { Switch } from '../src/primitives/Switch.tsx'
import { Tabs } from '../src/primitives/Tabs.tsx'
import { Toast } from '../src/primitives/Toast.tsx'
import { bindTooltipDismiss, Tooltip } from '../src/primitives/Tooltip.tsx'
import { VisuallyHidden } from '../src/primitives/VisuallyHidden.tsx'
import { withoutInlineStyle } from '../src/primitives/no-inline-style.ts'
import {
  interimProvenanceKinds,
  interimSeverities,
  interimStatusTones,
  provenanceLabels,
  severityToStatusTone,
  type InterimSeverity,
} from '../src/tokens/interim-contracts.ts'

const html = (element: ReactElement): string => renderToStaticMarkup(element)

const primitivesCss = readFileSync(
  new URL('../src/primitives/primitives.css', import.meta.url),
  'utf8',
)

/** The finite sets the layout primitives are restricted to at the type level. */
const spaceSteps = [2, 4, 8, 12, 16, 24, 32, 48, 64, 96] as const satisfies readonly SpaceStep[]
const stackDirections = ['column', 'row'] as const
const stackAligns = ['start', 'center', 'end', 'stretch', 'baseline'] as const
const stackJustifies = ['start', 'center', 'end', 'between'] as const
const gridColumnCounts = [2, 3, 4] as const
const skeletonLineCounts = [2, 3, 4, 5, 6] as const
const blockSkeletonVariants = skeletonVariants.filter(
  (variant): variant is Exclude<SkeletonVariant, 'text-block'> => variant !== 'text-block',
)

describe('Button', () => {
  it('defaults to type=button so it cannot submit a form by accident', () => {
    expect(html(<Button>Track a flight</Button>)).toContain('type="button"')
  })

  it('carries the variant class and the label', () => {
    const markup = html(<Button variant="secondary">Try the demo</Button>)
    expect(markup).toContain('dp-button--secondary')
    expect(markup).toContain('Try the demo')
  })

  it('requires an accessible name on an icon-only control', () => {
    const markup = html(
      <Button iconOnly aria-label="Close" variant="ghost">
        <Icon name="close" decorative />
      </Button>,
    )
    expect(markup).toContain('aria-label="Close"')
    expect(markup).toContain('dp-button--icon-only')
  })
})

describe('Link', () => {
  it('renders an anchor with the href', () => {
    expect(html(<Link href="/methodology/">Methodology</Link>)).toContain('href="/methodology/"')
  })

  // ACCESSIBILITY.md F17: the prop that opens a new tab is the prop that announces it, so a link
  // cannot be built that opens one silently.
  it('adds rel, target and an announcement together, and never adds sponsored', () => {
    const external = html(
      <Link href="https://example.org/rule" newTab="opens in a new tab">
        Official source
      </Link>,
    )
    expect(external).toContain('rel="noopener noreferrer"')
    expect(external).toContain('target="_blank"')
    expect(external).toContain('dp-visually-hidden')
    expect(external).toContain('opens in a new tab')
    expect(external).not.toContain('sponsored')

    const internal = html(<Link href="/terms/">Terms</Link>)
    expect(internal).not.toContain('target=')
    expect(internal).not.toContain('dp-visually-hidden')
  })
})

describe('Card, Badge, Stack, Grid, VisuallyHidden', () => {
  it('renders the requested sectioning element', () => {
    expect(html(<Card as="article">body</Card>)).toMatch(
      /^<article class="dp-card dp-card--raised"/,
    )
  })

  it('gives a numeric badge tabular figures', () => {
    expect(html(<Badge numeric>18</Badge>)).toContain('tnum')
  })

  // The gap used to be an inline style, which `style-src 'self'` discards: every Stack on the real
  // site rendered with the browser default gap of zero. It is now an attribute over the scale, and
  // primitives.css answers one step per rule.
  it('takes its gap from the spacing scale, as an attribute the CSP allows', () => {
    const markup = html(<Stack gap={24}>row</Stack>)
    expect(markup).toContain('data-gap="24"')
    expect(markup).not.toContain('style=')
  })

  it('carries direction, alignment, justification and wrapping as attributes', () => {
    const markup = html(
      <Stack direction="row" align="baseline" justify="between" wrap>
        row
      </Stack>,
    )
    expect(markup).toContain('data-direction="row"')
    expect(markup).toContain('data-align="baseline"')
    expect(markup).toContain('data-justify="between"')
    expect(markup).toContain('data-wrap="true"')
    expect(html(<Stack>column</Stack>)).not.toContain('data-wrap')
  })

  it('publishes the 8 + 4 cockpit split and a full-width row', () => {
    const markup = html(
      <Grid variant="cockpit">
        <GridArea area="primary">itinerary</GridArea>
        <GridArea area="secondary">sources</GridArea>
        <GridArea area="full">disruption notice</GridArea>
      </Grid>,
    )
    expect(markup).toContain('data-variant="cockpit"')
    expect(markup).toContain('dp-grid__primary')
    expect(markup).toContain('dp-grid__secondary')
    expect(markup).toContain('dp-grid__full')
    // The cockpit is always 8+4, so it never claims a column count.
    expect(markup).not.toContain('data-columns')
  })

  it('names an even column count instead of composing a template string', () => {
    const markup = html(<Grid columns={3}>cells</Grid>)
    expect(markup).toContain('data-variant="equal"')
    expect(markup).toContain('data-columns="3"')
    expect(markup).not.toContain('style=')
  })

  it('keeps hidden text in the accessibility tree', () => {
    const markup = html(<VisuallyHidden>Loading flight status</VisuallyHidden>)
    expect(markup).toContain('dp-visually-hidden')
    expect(markup).toContain('Loading flight status')
    expect(markup).not.toContain('hidden=')
  })
})

describe('Icon', () => {
  it('hides a decorative glyph and names a meaningful one', () => {
    expect(html(<Icon name="check" decorative />)).toContain('aria-hidden="true"')
    const titled = html(<Icon name="status-critical" title="Cancelled" />)
    expect(titled).toContain('role="img"')
    expect(titled).toContain('<title>Cancelled</title>')
  })

  it('draws every named glyph', () => {
    for (const name of iconNames) {
      expect(html(<Icon name={name} decorative />)).toContain('<path')
    }
  })

  it('gives the four status tones four different silhouettes', () => {
    const shapes = interimStatusTones.map((tone) =>
      html(<Icon name={`status-${tone}`} decorative />),
    )
    expect(new Set(shapes).size).toBe(4)
  })

  it('draws no two glyphs the same, so a name is never a synonym for another mark', () => {
    const drawn = iconNames.map((name) => html(<Icon name={name} decorative />))
    expect(new Set(drawn).size).toBe(iconNames.length)
  })

  /**
   * `info` exists so explanatory prose — the §26 disclaimers, a method note — stops borrowing
   * `status-unknown`, which means the specific thing "insufficient fresh information". A note that
   * renders the unknown glyph tells a reader the product is missing data when it is not.
   */
  it('carries a neutral information glyph that is not any status mark', () => {
    const info = html(<Icon name="info" decorative />)
    expect(info).toContain('<path')
    for (const tone of interimStatusTones) {
      expect(info, `info vs status-${tone}`).not.toBe(
        html(<Icon name={`status-${tone}`} decorative />),
      )
    }
    // Neutral means neutral: no fill, so it takes the colour of the text it sits beside.
    expect(info).not.toContain('fill="currentColor"')
  })
})

describe('StatusPill', () => {
  it.each(interimStatusTones)('renders %s with a shape, a label and a tone', (tone) => {
    const markup = html(<StatusPill status={tone} label={`state ${tone}`} />)
    expect(markup).toContain(`dp-status-pill--${tone}`)
    expect(markup).toContain('<svg')
    expect(markup).toContain(`state ${tone}`)
  })

  it('renders unknown at full strength, never as a blank or a dash', () => {
    const markup = html(<StatusPill status="unknown" label="Unknown" />)
    expect(markup).toContain('Unknown')
    expect(markup).not.toContain('opacity')
    expect(markup).not.toMatch(/>\s*[—–-]\s*</)
  })

  it('sets tabular figures on the trailing detail', () => {
    expect(html(<StatusPill status="watch" label="Watch" detail="18 min" />)).toContain('tnum')
  })
})

describe('ProvenanceChip', () => {
  it('has exactly six variants', () => {
    expect(interimProvenanceKinds).toHaveLength(6)
    expect(Object.keys(provenanceLabels)).toHaveLength(6)
  })

  it('renders the AGENTS.md §1.2 label verbatim as visible text', () => {
    const expected = {
      live: 'Live',
      cached: 'Cached',
      stale: 'Stale',
      demo: 'Demo',
      unavailable: 'Unavailable',
      heuristic: 'Heuristic risk band',
    }
    for (const kind of interimProvenanceKinds) {
      const markup = html(<ProvenanceChip kind={kind} />)
      expect(markup).toContain(`>${expected[kind]}</span>`)
      expect(markup).toContain(`data-provenance="${kind}"`)
    }
  })

  it('gives every variant its own glyph, and Demo one that is not a dot', () => {
    const glyphs = interimProvenanceKinds.map((kind) => {
      const markup = html(<ProvenanceChip kind={kind} />)
      return markup.slice(markup.indexOf('<svg'), markup.indexOf('</svg>'))
    })
    expect(new Set(glyphs).size).toBe(6)

    const live = html(<ProvenanceChip kind="live" />)
    const demo = html(<ProvenanceChip kind="demo" />)
    expect(demo).not.toContain('dp-chip--live')
    expect(live).not.toContain('dp-chip--demo')
    expect(demo.slice(demo.indexOf('<svg'))).not.toBe(live.slice(live.indexOf('<svg')))
  })

  it('carries a freshness string without truncating it', () => {
    const markup = html(<ProvenanceChip kind="stale" freshness="Updated 6 minutes ago from ADSB" />)
    expect(markup).toContain('Updated 6 minutes ago from ADSB')
    expect(markup).toContain('dp-chip__freshness')
    expect(markup).not.toContain('text-overflow')
    expect(markup).not.toContain('…')
  })
})

describe('Field, Input, Select, Combobox', () => {
  it('wires label, hint and error onto one control', () => {
    const markup = html(
      <Field label="Flight number" hint="For example 1234" error="Enter a flight number" required>
        {(control) => <Input {...control} />}
      </Field>,
    )
    expect(markup).toContain('aria-invalid="true"')
    expect(markup).toContain('dp-field__error')
    const described = /aria-describedby="([^"]+)"/.exec(markup)?.[1]
    expect(described).toBeDefined()
    for (const id of described?.split(' ') ?? []) {
      expect(markup).toContain(`id="${id}"`)
    }
    const labelFor = /for="([^"]+)"/.exec(markup)?.[1]
    expect(markup).toContain(`id="${String(labelFor)}"`)
  })

  it('gives a numeric input tabular figures', () => {
    expect(html(<Input numeric aria-label="Flight number" />)).toContain('tnum')
  })

  it('keeps the native select and hides the decorative chevron', () => {
    const markup = html(
      <Select aria-label="Jurisdiction">
        <option value="eu">EU</option>
      </Select>,
    )
    expect(markup).toContain('<select')
    expect(markup).toContain('aria-hidden="true"')
  })

  it('implements the WAI-ARIA combobox wiring', () => {
    const markup = html(
      <Combobox listboxId="airports" expanded activeOptionId="airports-0" aria-label="Airport">
        <ComboboxListbox id="airports" aria-label="Airport">
          <ComboboxOption id="airports-0" selected active onSelect={() => undefined}>
            LHR
          </ComboboxOption>
        </ComboboxListbox>
      </Combobox>,
    )
    expect(markup).toContain('role="combobox"')
    expect(markup).toContain('aria-expanded="true"')
    expect(markup).toContain('aria-controls="airports"')
    expect(markup).toContain('aria-activedescendant="airports-0"')
    expect(markup).toContain('role="listbox"')
    expect(markup).toContain('role="option"')
    expect(markup).toContain('aria-selected="true"')
  })

  // ACCESSIBILITY.md B1. aria-activedescendant keeps DOM focus on the input, so the active option's
  // styling is the only statement of where Enter lands. The class has to reach the option element
  // for primitives.css to have anything to style; the measured ratio of that styling is asserted in
  // tokens.test.ts and in the contrast suite.
  it('marks the active option with its own class, distinct from the selected one', () => {
    const active = html(
      <ComboboxOption id="a" selected={false} active onSelect={() => undefined}>
        LHR
      </ComboboxOption>,
    )
    const selected = html(
      <ComboboxOption id="a" selected active={false} onSelect={() => undefined}>
        LHR
      </ComboboxOption>,
    )
    expect(active).toContain('dp-combobox__option is-active')
    expect(active).toContain('aria-selected="false"')
    expect(selected).not.toContain('is-active')
    expect(selected).toContain('aria-selected="true"')
  })
})

describe('Checkbox, Radio, Switch', () => {
  it('keeps a native input behind the drawn control', () => {
    expect(html(<Checkbox name="alerts">Email alerts</Checkbox>)).toContain('type="checkbox"')
    expect(html(<Radio name="mode">Self-transfer</Radio>)).toContain('type="radio"')
  })

  it('marks a mixed checkbox as mixed', () => {
    expect(html(<Checkbox indeterminate>Some</Checkbox>)).toContain('aria-checked="mixed"')
  })

  // ACCESSIBILITY.md F8: the state word is visible text, never part of the accessible name.
  it('names the switch from its label, leaving the state to aria-checked', () => {
    const markup = html(
      <Switch checked onCheckedChange={() => undefined} label="Monitoring" stateLabel="On" />,
    )
    const labelledBy = /aria-labelledby="([^"]+)"/.exec(markup)?.[1]
    expect(labelledBy).toBeDefined()
    expect(markup).toContain(`id="${String(labelledBy)}"`)
    expect(markup).toContain(
      `<span class="dp-switch__label" id="${String(labelledBy)}">Monitoring</span>`,
    )
    // The state word is outside the name, and it is still on the page as text.
    expect(markup).toContain('dp-switch__state')
    expect(markup).toContain('>On<')
    expect(markup).not.toContain('aria-label=')
  })

  it('renders a switch with its state as words as well as a position', () => {
    const markup = html(
      <Switch checked label="Monitoring" stateLabel="On" onCheckedChange={() => undefined} />,
    )
    expect(markup).toContain('role="switch"')
    expect(markup).toContain('aria-checked="true"')
    expect(markup).toContain('>On</span>')
  })
})

describe('Dialog and Drawer', () => {
  it('renders nothing when closed', () => {
    expect(
      html(
        <Dialog open={false} onClose={() => undefined} title="Delete trip" closeLabel="Close">
          body
        </Dialog>,
      ),
    ).toBe('')
  })

  it('is a labelled modal with a named close control', () => {
    const markup = html(
      <Dialog open onClose={() => undefined} title="Delete trip" closeLabel="Close">
        body
      </Dialog>,
    )
    expect(markup).toContain('role="dialog"')
    expect(markup).toContain('aria-modal="true"')
    expect(markup).toContain('aria-label="Close"')
    const labelledBy = /aria-labelledby="([^"]+)"/.exec(markup)?.[1]
    expect(markup).toContain(`id="${String(labelledBy)}"`)
  })

  it('anchors a drawer to an edge and stays modal', () => {
    const markup = html(
      <Drawer open onClose={() => undefined} title="Filters" closeLabel="Close" side="end">
        body
      </Drawer>,
    )
    expect(markup).toContain('dp-drawer--end')
    expect(markup).toContain('aria-modal="true"')
  })

  // ACCESSIBILITY.md F14: a hard-coded h2 opened from under an h3 breaks the page heading order.
  it('takes a heading level, defaulting to h2', () => {
    const fallback = html(
      <Dialog open onClose={() => undefined} title="Delete trip" closeLabel="Close">
        body
      </Dialog>,
    )
    const nested = html(
      <Dialog
        open
        onClose={() => undefined}
        title="Delete trip"
        closeLabel="Close"
        headingLevel={3}
      >
        body
      </Dialog>,
    )
    expect(fallback).toContain('<h2 class="dp-dialog__title"')
    expect(nested).toContain('<h3 class="dp-dialog__title"')
  })
})

describe('Tooltip, Tabs, Disclosure', () => {
  it('describes its trigger and stays hidden until shown', () => {
    const markup = html(
      <Tooltip trigger={<button type="button">Slack</button>}>Minutes spare</Tooltip>,
    )
    expect(markup).toContain('role="tooltip"')
    expect(markup).toContain('hidden')
    const describedBy = /aria-describedby="([^"]+)"/.exec(markup)?.[1]
    expect(markup).toContain(`id="${String(describedBy)}"`)
  })

  /**
   * ACCESSIBILITY.md B5, SC 1.4.13 "dismissible". The listener that Tooltip installs on `document`
   * while it is open, exercised against a stand-in target: a wrapper-scoped handler only ever sees
   * keydowns whose target is inside the wrapper, which is never the case for a tooltip opened by
   * hover. There is no DOM environment at this runner, so the binder is exported and tested
   * directly rather than asserted to exist by reading the source.
   */
  it('dismisses on Escape from anywhere, stops the key, and unbinds on close', () => {
    const bound: ((event: { key: string; stopPropagation: () => void }) => void)[] = []
    const target = {
      addEventListener(
        _type: 'keydown',
        listener: (event: { key: string; stopPropagation: () => void }) => void,
        capture: boolean,
      ): void {
        expect(capture).toBe(true)
        bound.push(listener)
      },
      removeEventListener(
        _type: 'keydown',
        listener: (event: { key: string; stopPropagation: () => void }) => void,
      ): void {
        const at = bound.indexOf(listener)
        if (at >= 0) bound.splice(at, 1)
      },
    }

    let dismissed = 0
    let stopped = 0
    const key = (name: string): { key: string; stopPropagation: () => void } => ({
      key: name,
      stopPropagation: () => {
        stopped += 1
      },
    })

    const unbind = bindTooltipDismiss(target, () => {
      dismissed += 1
    })
    expect(bound).toHaveLength(1)

    bound[0]?.(key('a'))
    expect(dismissed).toBe(0)

    bound[0]?.(key('Escape'))
    expect(dismissed).toBe(1)
    // The innermost layer owns Escape: a Dialog behind the tooltip must not close too.
    expect(stopped).toBe(1)

    unbind()
    expect(bound).toHaveLength(0)
  })

  it('renders a roving-tabindex tablist with one visible panel', () => {
    const markup = html(
      <Tabs
        label="Trip sections"
        selectedId="a"
        onSelect={() => undefined}
        tabs={[
          { id: 'a', label: 'Itinerary', panel: 'one' },
          { id: 'b', label: 'Sources', panel: 'two' },
        ]}
      />,
    )
    expect(markup).toContain('role="tablist"')
    expect(markup).toContain('aria-selected="true"')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('tabindex="-1"')
    expect(markup).toContain('role="tabpanel"')
    expect(markup).toContain('hidden')
  })

  it('uses native details so state, keyboard and find-in-page come for free', () => {
    const markup = html(
      <Disclosure summary="Why this assessment" defaultOpen>
        reasoning
      </Disclosure>,
    )
    expect(markup).toContain('<details')
    expect(markup).toContain('<summary')
    expect(markup).toContain('open')
  })
})

describe('DataTable', () => {
  const markup = html(
    <DataTable
      caption="Status chronology"
      rowKey={(row) => row.id}
      rows={[{ id: '1', at: '14:05', note: 'Gate change' }]}
      columns={[
        { key: 'at', header: 'Time', numeric: true, rowHeader: true, cell: (row) => row.at },
        { key: 'note', header: 'Change', cell: (row) => row.note },
      ]}
    />,
  )

  it('uses real headers with real scopes', () => {
    expect(markup).toContain('scope="col"')
    expect(markup).toContain('scope="row"')
    expect(markup).toContain('<caption')
  })

  it('gives numeric columns tabular figures', () => {
    expect(markup).toContain('dp-table__cell--numeric tnum')
  })

  // ACCESSIBILITY.md B6, SC 2.1.1. The shell scrolls horizontally; Safari does not make a scroll
  // container focusable on its own, so columns past the fold were pointer-only.
  it('exposes the scroll container as a focusable region named by the caption', () => {
    expect(markup).toContain('role="region"')
    expect(markup).toContain('tabindex="0"')
    const labelledBy = /aria-labelledby="([^"]+)"/.exec(markup)?.[1]
    expect(labelledBy).toBeDefined()
    expect(markup).toContain(
      `<caption class="dp-table__caption" id="${String(labelledBy)}">Status chronology</caption>`,
    )
  })
})

describe('Skeleton, ProgressBar, AdSlot', () => {
  /**
   * The dimensions used to be `width` and `height` props written to an inline style, which the
   * served `style-src 'self'` discards — so the placeholder reserved nothing and became the layout
   * shift it exists to prevent (DIRECTIVE.md §22, CLS < 0.1). They are now a named variant, and
   * the rule that holds the box is asserted below against primitives.css.
   */
  it('reserves the final dimensions from a named variant and names what is loading', () => {
    const markup = html(<Skeleton variant="card" label="Loading flight status" />)
    expect(markup).toContain('data-variant="card"')
    expect(markup).toContain('Loading flight status')
    expect(markup).not.toContain('style=')
  })

  it('defaults to one line of body copy and claims no line count', () => {
    const markup = html(<Skeleton label="Loading flight status" />)
    expect(markup).toContain('data-variant="text-line"')
    expect(markup).not.toContain('data-lines')
    expect(markup).not.toContain('dp-skeleton__line')
  })

  it('reserves one line element per line of a paragraph', () => {
    const markup = html(<Skeleton variant="text-block" lines={4} label="Loading the summary" />)
    expect(markup).toContain('data-lines="4"')
    expect(markup.match(/dp-skeleton__line/g)).toHaveLength(4)
    expect(html(<Skeleton variant="text-block" label="Loading" />)).toContain('data-lines="3"')
  })

  /**
   * ACCESSIBILITY.md B4, DIRECTIVE.md §7 "aria-live only for meaningful changes". A cockpit renders
   * a grid of these; a live role on each one is a queue of polite announcements every time a panel
   * reloads, including on a poll that returned identical data. The loading REGION carries
   * `aria-busy`; the placeholder carries nothing.
   */
  it('is not a live region by default', () => {
    const markup = html(<Skeleton label="Loading flight status" />)
    expect(markup).not.toContain('role="status"')
    expect(markup).not.toContain('aria-live')
    expect(markup).not.toContain('role="alert"')
  })

  it('can be made a live region explicitly, once per view', () => {
    const markup = html(<Skeleton label="Loading" live />)
    expect(markup).toContain('role="status"')
  })

  it('is a linear meter with a text value, never a gauge', () => {
    const markup = html(
      <ProgressBar
        value={18}
        max={45}
        band="watch"
        bandLabel="Watch"
        label="Connection slack"
        valueText="18 of 45 minutes"
      />,
    )
    expect(markup).toContain('role="progressbar"')
    expect(markup).toContain('aria-valuenow="18"')
    expect(markup).toContain('aria-valuemax="45"')
    expect(markup).toContain('aria-valuetext="18 of 45 minutes, Watch"')
    expect(markup).toContain('dp-progress--watch')
    expect(markup).not.toMatch(/gauge|speedometer|dial|needle/i)
  })

  /**
   * ACCESSIBILITY.md B3 and B7, SC 1.4.1 and SC 1.3.1. Two failures in opposite directions, and the
   * assertion has to catch both: an ARIA attribute is exposed to assistive technology and to
   * nothing else, while everything inside `role="progressbar"` is presentational and exposed to
   * nobody. So the reading and the band each have to appear TWICE — once as a text node a sighted
   * reader gets, once in `aria-valuetext`. Stripping every ARIA attribute is how the first half is
   * measured: whatever survives is what is actually on the page.
   */
  it('renders the reading and the band as visible text AND in ARIA', () => {
    const markup = html(
      <ProgressBar
        value={18}
        max={45}
        band="watch"
        bandLabel="Watch"
        label="Connection slack"
        valueText="18 of 45 minutes"
      />,
    )
    const visible = markup.replace(/\s+aria-[a-z]+="[^"]*"/g, '')
    expect(visible).toContain('18 of 45 minutes')
    expect(visible).toContain('Watch')
    expect(markup).toContain('>18 of 45 minutes<')
    expect(markup).toContain('dp-progress__band')

    // B7: the band is a required prop and the recommended-action signal; an announced value that
    // omits it tells a screen-reader user how much slack is left and not what to do about it.
    const announced = /aria-valuetext="([^"]*)"/.exec(markup)?.[1]
    expect(announced).toBe('18 of 45 minutes, Watch')
    expect(announced).toContain('Watch')
  })

  it('clamps out-of-range readings instead of overflowing the track', () => {
    expect(
      html(<ProgressBar value={120} label="x" valueText="full" bandLabel="Unknown" />),
    ).toContain('aria-valuenow="100"')
  })

  /**
   * The extent used to be a custom property on an inline style, and the site serves
   * `style-src 'self'` with no `'unsafe-inline'` — so the declaration was discarded and the meter
   * rendered EMPTY at every reading, which made the B2 and B3 fixes invisible on the real site.
   * `width` on an SVG `<rect>` is a presentation attribute, which `style-src` does not govern.
   */
  it('draws the fill as an SVG geometry attribute at every reading', () => {
    const meter = (value: number | null): string =>
      html(
        <ProgressBar
          value={value}
          max={45}
          band="watch"
          bandLabel="Watch"
          label="Connection slack"
          valueText="18 of 45 minutes"
        />,
      )

    expect(meter(0)).toContain('width="0%"')
    expect(meter(18)).toContain('width="40%"')
    expect(meter(45)).toContain('width="100%"')
    // The drawing is presentational and the track is still there to be read against.
    expect(meter(18)).toContain('<svg class="dp-progress__meter" aria-hidden="true"')
    expect(meter(18)).toContain('dp-progress__track')
    expect(meter(18)).not.toContain('style=')
    // No percentage is rendered as text or announced anywhere (DIRECTIVE.md §18.5).
    expect(meter(18).replace(/<[^>]*>/g, '')).not.toMatch(/%|percent/i)
  })

  /**
   * `unknown` is a designed state (AGENTS.md §1.1): "0 of 45 minutes" is a claim about the flight,
   * so a meter with no fresh input draws no fill and omits `aria-valuenow` — WAI-ARIA 1.2's
   * spelling of "the current value is not known". The words stay the caller's.
   */
  it('draws no fill and claims no value when the reading is unknown', () => {
    const markup = html(
      <ProgressBar
        value={null}
        max={45}
        band="unknown"
        bandLabel="Unknown"
        label="Connection slack"
        valueText="Slack unknown"
      />,
    )
    expect(markup).not.toContain('aria-valuenow')
    expect(markup).not.toContain('<rect')
    expect(markup).toContain('dp-progress__track')
    expect(markup).toContain('aria-valuetext="Slack unknown, Unknown"')
    expect(markup).toContain('>Slack unknown<')
    expect(markup).not.toMatch(/>\s*[—–-]\s*</)
  })

  /**
   * ACCESSIBILITY.md F13: `<aside>` with a name is a `complementary` landmark however deeply it is
   * nested, so two slots on a page produced two identically named landmarks.
   */
  it('reserves and labels an ad slot without adding a landmark, and drops it from print', () => {
    const markup = html(<AdSlot label="Advertisement" size="300x250" />)
    expect(markup).not.toContain('<aside')
    expect(markup).toContain('role="group"')
    const labelledBy = /aria-labelledby="([^"]+)"/.exec(markup)?.[1]
    expect(markup).toContain(
      `<span class="dp-ad-slot__label" id="${String(labelledBy)}">Advertisement</span>`,
    )
    // The reserved box is a named IAB unit resolved in CSS, because an inline style is discarded by
    // the served policy and a slot that reserves nothing is a CLS defect (AGENTS.md §4).
    expect(markup).toContain('data-size="300x250"')
    expect(markup).not.toContain('style=')
    expect(markup).toContain('dp-no-print')
  })
})

describe('Callout and Toast', () => {
  it.each(interimSeverities)('renders %s with an icon, a title and a status tone', (severity) => {
    const markup = html(
      <Callout severity={severity} title={`Title ${severity}`}>
        body
      </Callout>,
    )
    expect(markup).toContain(`dp-callout--${severity}`)
    expect(markup).toContain('<svg')
    expect(markup).toContain(`Title ${severity}`)
    expect(markup).toContain('data-status-tone=')
  })

  it('interrupts only for an urgent toast', () => {
    const urgent = html(
      <Toast
        severity="urgent"
        title="Cancelled"
        dismissLabel="Dismiss"
        onDismiss={() => undefined}
      />,
    )
    const info = html(
      <Toast severity="info" title="Gate set" dismissLabel="Dismiss" onDismiss={() => undefined} />,
    )
    expect(urgent).toContain('role="alert"')
    expect(info).toContain('role="status"')
    expect(urgent).toContain('aria-label="Dismiss"')
  })

  /**
   * F34. Both maps sent severity `info` to the `status-unknown` glyph, so an informational notice
   * wore the mark whose meaning in this product is the specific one of "insufficient fresh
   * information" (`AGENTS.md §1.1`) — and `Callout`'s docblock claim of a shape per severity was
   * false at four severities and three shapes. `severityToStatusTone` still sends `info` to the
   * neutral tone, because four tones and never a fifth is right; but once two severities share a
   * colour the glyph is the only channel left, so it is the glyph that has to differ.
   *
   * Identified by NAME, not by geometry: the Icon suite above proves no two glyphs render the same
   * markup, so an exact match against a reference render names the glyph a primitive drew.
   */
  const glyphNameIn = (markup: string, className: string): string => {
    const svg = /<svg[\s\S]*?<\/svg>/.exec(markup)?.[0] ?? '(no glyph rendered)'
    const name = iconNames.find(
      (candidate) => html(<Icon name={candidate} decorative className={className} />) === svg,
    )
    return name ?? '(unrecognised glyph)'
  }

  const glyphPerSeverity = (
    render: (severity: InterimSeverity) => string,
    className: string,
  ): Record<string, string> =>
    Object.fromEntries(
      interimSeverities.map((severity) => [severity, glyphNameIn(render(severity), className)]),
    )

  it('draws a different shape for each of the four severities, and never the unknown mark', () => {
    const expected: Record<string, IconName> = {
      info: 'info',
      watch: 'status-watch',
      urgent: 'status-critical',
      resolved: 'status-safe',
    }

    const callout = glyphPerSeverity(
      (severity) => html(<Callout severity={severity} title={`Title ${severity}`} />),
      'dp-callout__icon',
    )
    const toast = glyphPerSeverity(
      (severity) =>
        html(
          <Toast
            severity={severity}
            title={`Title ${severity}`}
            dismissLabel="Dismiss"
            onDismiss={() => undefined}
          />,
        ),
      'dp-toast__icon',
    )

    expect(callout).toEqual(expected)
    expect(toast).toEqual(expected)
    // Four severities, four shapes: the claim the docblock makes, asserted rather than trusted.
    expect(new Set(Object.values(callout)).size).toBe(interimSeverities.length)
    expect(new Set(Object.values(toast)).size).toBe(interimSeverities.length)
    // The neutral TONE is deliberate and stays; only the shape had to move off the status mark.
    expect(severityToStatusTone.info).toBe('unknown')
  })

  /**
   * F25 (SC 1.3.1). Two of the fifteen `§18.5` cockpit sections are Callouts — the unavailable
   * weather panel and the upgrade prompt — so with a `<p>` title a heading-list jump skipped
   * exactly the two panels that say a thing is unavailable. The level is optional and the default
   * is unchanged, because a heading that opens no section is as wrong as a section with none.
   */
  it('renders the title as a <p> when no heading level is asked for', () => {
    const markup = html(
      <Callout severity="info" title="Weather and airspace">
        body
      </Callout>,
    )
    expect(markup).toContain('<p class="dp-callout__title">Weather and airspace</p>')
    expect(markup).not.toMatch(/<h[1-6][\s>]/)
  })

  it.each([2, 3, 4] as const)('renders the title as an h%s when the section needs one', (level) => {
    const markup = html(
      <Callout severity="info" title="Weather and airspace" headingLevel={level}>
        body
      </Callout>,
    )
    const tag = `h${String(level)}`
    expect(markup).toContain(`<${tag} class="dp-callout__title">Weather and airspace</${tag}>`)
    expect(markup).not.toContain('<p class="dp-callout__title">')
    // The rest of the callout is untouched: same icon, same tone, same body.
    expect(glyphNameIn(markup, 'dp-callout__icon')).toBe('info')
    expect(markup).toContain('data-status-tone="unknown"')
    expect(markup).toContain('<div class="dp-callout__body">body</div>')
  })

  /**
   * An `aria-labelledby` pointing at the title has to survive the element changing under it —
   * that reference is how an error summary announces itself by name on arrival.
   */
  it.each([undefined, 2, 3, 4] as const)(
    'keeps an aria-labelledby reference to the title resolvable at level %s',
    (level) => {
      const markup = html(
        <div role="group" aria-labelledby="errors-title">
          <Callout
            severity="urgent"
            title="Check these fields"
            titleId="errors-title"
            headingLevel={level}
          >
            <ul />
          </Callout>
        </div>,
      )

      const declared = new Set(
        [...markup.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1] ?? ''),
      )
      const referenced = [...markup.matchAll(/aria-labelledby="([^"]*)"/g)].flatMap((match) =>
        (match[1] ?? '').split(' '),
      )

      expect(referenced).toEqual(['errors-title'])
      for (const reference of referenced) {
        expect(declared, `aria-labelledby="${reference}" resolves`).toContain(reference)
      }
      const tag = level === undefined ? 'p' : `h${String(level)}`
      expect(markup).toMatch(
        new RegExp(
          `<${tag} class="dp-callout__title" id="errors-title">Check these fields</${tag}>`,
        ),
      )
    },
  )
})

/**
 * The Content-Security-Policy gate.
 *
 * `apps/web/public/_headers` serves `style-src 'self'` with no `'unsafe-inline'`. That directive
 * governs the `style` ATTRIBUTE as well as the `<style>` element — Chromium refuses it outright,
 * "Refused to apply inline style because it violates the following Content Security Policy
 * directive: style-src 'self'" — and an attribute value cannot be allowed by hash, because the hash
 * would have to be computed over content that changes on every render.
 *
 * So an inline style in a primitive is not a style-guide preference. It is a declaration the
 * browser throws away: the ProgressBar fill was positioned by an inline custom property and the
 * meter rendered empty at every reading; Stack gaps collapsed to zero; Skeleton and AdSlot reserved
 * no space at all. This renders every primitive across every documented prop value and requires
 * `style=` to be absent from all of it.
 */
describe('no primitive emits an inline style (CSP style-src self)', () => {
  const cases: Readonly<Record<string, readonly ReactElement[]>> = {
    Button: [
      ...(['primary', 'secondary', 'ghost'] as const).flatMap((variant) => [
        <Button variant={variant}>Track a flight</Button>,
        <Button variant={variant} block>
          Track a flight
        </Button>,
        <Button variant={variant} iconOnly aria-label="Close">
          <Icon name="close" decorative />
        </Button>,
      ]),
      <Button disabled type="submit">
        Submit
      </Button>,
    ],
    Link: [
      ...(['inline', 'standalone'] as const).map((variant) => (
        <Link href="/methodology/" variant={variant}>
          Methodology
        </Link>
      )),
      <Link href="https://example.org/rule" newTab="opens in a new tab">
        Official source
      </Link>,
      <Link href="/trip/" iconOnly aria-label="Open trip">
        <Icon name="chevron-down" decorative />
      </Link>,
    ],
    Card: (['div', 'section', 'article', 'li'] as const).flatMap((as) =>
      (['raised', 'flat'] as const).map((variant) => (
        <Card as={as} variant={variant} aria-label="Panel">
          body
        </Card>
      )),
    ),
    Badge: (['neutral', 'accent'] as const).flatMap((tone) => [
      <Badge tone={tone}>Saved</Badge>,
      <Badge tone={tone} numeric>
        18
      </Badge>,
    ]),
    Stack: [
      ...spaceSteps.map((gap) => <Stack gap={gap}>gap</Stack>),
      ...stackDirections.flatMap((direction) =>
        stackAligns.flatMap((align) =>
          stackJustifies.flatMap((justify) =>
            [false, true].map((wrap) => (
              <Stack direction={direction} align={align} justify={justify} wrap={wrap}>
                cell
              </Stack>
            )),
          ),
        ),
      ),
    ],
    Grid: [
      ...gridColumnCounts.map((columns) => <Grid columns={columns}>cells</Grid>),
      <Grid variant="cockpit">
        <GridArea area="primary">itinerary</GridArea>
        <GridArea area="secondary">sources</GridArea>
        <GridArea area="full">disruption notice</GridArea>
      </Grid>,
    ],
    Icon: [
      ...iconNames.map((name) => <Icon name={name} decorative />),
      <Icon name="status-critical" title="Cancelled" />,
    ],
    StatusPill: interimStatusTones.flatMap((status) => [
      <StatusPill status={status} label={`state ${status}`} />,
      <StatusPill status={status} label={`state ${status}`} detail="18 min" />,
    ]),
    ProvenanceChip: interimProvenanceKinds.flatMap((kind) => [
      <ProvenanceChip kind={kind} />,
      <ProvenanceChip kind={kind} freshness="Updated 6 minutes ago from ADSB" />,
    ]),
    Field: [
      <Field label="Flight number">{(control) => <Input {...control} />}</Field>,
      <Field
        label="Flight number"
        hint="For example 1234"
        error="Enter a flight number"
        required
        requirementNote="Required"
      >
        {(control) => <Input {...control} numeric />}
      </Field>,
    ],
    Input: [
      <Input aria-label="Flight number" />,
      <Input aria-label="Flight number" numeric placeholder="1234" inputMode="numeric" />,
    ],
    Select: [
      <Select aria-label="Jurisdiction" defaultValue="eu">
        <option value="eu">EU</option>
      </Select>,
    ],
    Combobox: [
      <Combobox listboxId="airports" expanded activeOptionId="airports-0" aria-label="Airport">
        <ComboboxListbox id="airports" aria-label="Airport">
          <ComboboxOption id="airports-0" selected active onSelect={() => undefined}>
            LHR
          </ComboboxOption>
          <ComboboxOption
            id="airports-1"
            selected={false}
            active={false}
            onSelect={() => undefined}
          >
            LGW
          </ComboboxOption>
        </ComboboxListbox>
      </Combobox>,
      <Combobox listboxId="airports" expanded={false} aria-label="Airport">
        <ComboboxListbox id="airports" aria-label="Airport" hidden>
          <ComboboxOption id="airports-0" selected={false} active onSelect={() => undefined}>
            LHR
          </ComboboxOption>
        </ComboboxListbox>
      </Combobox>,
    ],
    Checkbox: [
      <Checkbox name="alerts">Email alerts</Checkbox>,
      <Checkbox name="alerts" defaultChecked>
        Email alerts
      </Checkbox>,
      <Checkbox name="alerts" indeterminate>
        Some
      </Checkbox>,
    ],
    Radio: [
      <Radio name="mode">Self-transfer</Radio>,
      <Radio name="mode" defaultChecked>
        Through-checked
      </Radio>,
    ],
    Switch: [false, true].map((checked) => (
      <Switch
        checked={checked}
        onCheckedChange={() => undefined}
        label="Monitoring"
        stateLabel={checked ? 'On' : 'Off'}
      />
    )),
    Dialog: ([2, 3, 4] as const).map((headingLevel) => (
      <Dialog
        open
        onClose={() => undefined}
        title="Delete trip"
        closeLabel="Close"
        headingLevel={headingLevel}
        footer={<Button variant="secondary">Cancel</Button>}
      >
        body
      </Dialog>
    )),
    Drawer: (['bottom', 'end'] as const).map((side) => (
      <Drawer open onClose={() => undefined} title="Filters" closeLabel="Close" side={side}>
        body
      </Drawer>
    )),
    Tooltip: [<Tooltip trigger={<button type="button">Slack</button>}>Minutes spare</Tooltip>],
    Tabs: [
      <Tabs
        label="Trip sections"
        selectedId="a"
        onSelect={() => undefined}
        tabs={[
          { id: 'a', label: 'Itinerary', panel: 'one' },
          { id: 'b', label: 'Sources', panel: 'two' },
        ]}
      />,
    ],
    Disclosure: [false, true].map((defaultOpen) => (
      <Disclosure summary="Why this assessment" defaultOpen={defaultOpen} name="reasoning">
        reasoning
      </Disclosure>
    )),
    DataTable: [
      <DataTable
        caption="Status chronology"
        rowKey={(row) => row.id}
        rows={[{ id: '1', at: '14:05', note: 'Gate change' }]}
        columns={[
          { key: 'at', header: 'Time', numeric: true, rowHeader: true, cell: (row) => row.at },
          { key: 'note', header: 'Change', cell: (row) => row.note },
        ]}
      />,
    ],
    Skeleton: [
      ...blockSkeletonVariants.map((variant) => <Skeleton variant={variant} label="Loading" />),
      ...skeletonLineCounts.map((lines) => (
        <Skeleton variant="text-block" lines={lines} label="Loading" />
      )),
      <Skeleton label="Loading" live />,
    ],
    ProgressBar: interimStatusTones.flatMap((band) =>
      [0, 18, 45, 120, null].map((value) => (
        <ProgressBar
          value={value}
          max={45}
          band={band}
          bandLabel="Watch"
          label="Connection slack"
          valueText="18 of 45 minutes"
        />
      )),
    ),
    AdSlot: [
      ...adSlotSizes.map((size) => <AdSlot label="Advertisement" size={size} />),
      <AdSlot label="Advertisement" size="300x250">
        <span>unit</span>
      </AdSlot>,
    ],
    Callout: interimSeverities.flatMap((severity) => [
      <Callout severity={severity} title={`Title ${severity}`}>
        body
      </Callout>,
      <Callout
        severity={severity}
        title={`Title ${severity}`}
        action={<Button variant="secondary">Act</Button>}
      >
        body
      </Callout>,
      ...([2, 3, 4] as const).map((headingLevel) => (
        <Callout
          severity={severity}
          title={`Title ${severity}`}
          headingLevel={headingLevel}
          titleId={`callout-${severity}-${String(headingLevel)}`}
        >
          body
        </Callout>
      )),
    ]),
    Toast: interimSeverities.map((severity) => (
      <Toast
        severity={severity}
        title={`Title ${severity}`}
        dismissLabel="Dismiss"
        onDismiss={() => undefined}
      >
        body
      </Toast>
    )),
    VisuallyHidden: (['span', 'div'] as const).map((as) => (
      <VisuallyHidden as={as}>Loading flight status</VisuallyHidden>
    )),
  }

  it('covers every primitive in the package', () => {
    // Read from the directory, not from a hand-kept list: a new primitive with no case here would
    // otherwise pass this suite silently, and the next inline style would ship with it.
    const modules = readdirSync(new URL('../src/primitives/', import.meta.url))
      .filter((file) => file.endsWith('.tsx'))
      .map((file) => file.replace(/\.tsx$/, ''))
      .sort()
    expect(Object.keys(cases).sort()).toEqual(modules)
    expect(Object.values(cases).flat().length).toBeGreaterThan(150)
  })

  it.each(Object.entries(cases))('%s', (name, elements) => {
    elements.forEach((element, index) => {
      expect(html(element), `${name} case ${String(index)}`).not.toContain('style=')
    })
  })

  it('drops a style a caller forces through, not only at the type level', () => {
    const stripped = withoutInlineStyle({ id: 'flight', style: { color: 'red' } })
    expect(Object.keys(stripped)).toEqual(['id'])

    // Through a primitive that spreads native attributes: the guard is in the render path, so an
    // untyped caller cannot reintroduce what the policy forbids.
    const forced = { children: 'Track a flight', style: { color: 'red' } }
    expect(html(createElement(Button, forced))).not.toContain('style=')
  })
})

/**
 * The finite sets are only safe if the stylesheet answers all of them. A variant with markup but no
 * rule reserves nothing, which is the CLS defect (`DIRECTIVE.md §22`) in a new costume — so the
 * type-level set and the CSS are asserted against each other rather than kept in step by memory.
 */
describe('every attribute value the primitives emit has a rule in primitives.css', () => {
  it('answers every step of the spacing scale', () => {
    for (const gap of spaceSteps) {
      expect(primitivesCss, `gap ${String(gap)}`).toContain(`.dp-stack[data-gap='${String(gap)}']`)
    }
  })

  it('answers every Stack direction, alignment and justification', () => {
    for (const direction of stackDirections) {
      expect(primitivesCss).toContain(`.dp-stack[data-direction='${direction}']`)
    }
    for (const align of stackAligns) {
      expect(primitivesCss).toContain(`.dp-stack[data-align='${align}']`)
    }
    for (const justify of stackJustifies) {
      expect(primitivesCss).toContain(`.dp-stack[data-justify='${justify}']`)
    }
    expect(primitivesCss).toContain(".dp-stack[data-wrap='true']")
  })

  it('answers every Grid variant, column count and area', () => {
    for (const variant of ['equal', 'cockpit'] as const) {
      expect(primitivesCss).toContain(`.dp-grid[data-variant='${variant}']`)
    }
    for (const columns of gridColumnCounts) {
      expect(primitivesCss).toContain(`[data-columns='${String(columns)}']`)
    }
    for (const area of ['primary', 'secondary', 'full'] as const) {
      expect(primitivesCss).toContain(`.dp-grid__${area}`)
    }
    // The cockpit split stays on the published grid tokens rather than a literal 8 and 4.
    expect(primitivesCss).toContain('grid-column: span var(--grid-cockpit-primary);')
    expect(primitivesCss).toContain('grid-column: span var(--grid-cockpit-secondary);')
  })

  it('reserves a box for every Skeleton variant', () => {
    for (const variant of skeletonVariants) {
      expect(primitivesCss, variant).toContain(`.dp-skeleton[data-variant='${variant}']`)
    }
  })

  it('reserves a box for every AdSlot size', () => {
    for (const size of adSlotSizes) {
      const [width, height] = size.split('x')
      const rule = primitivesCss.slice(
        primitivesCss.indexOf(`.dp-ad-slot[data-size='${size}']`),
        primitivesCss.indexOf(`.dp-ad-slot[data-size='${size}']`) + 160,
      )
      expect(rule, size).toContain(`inline-size: ${String(width)}px;`)
      expect(rule, size).toContain(`block-size: ${String(height)}px;`)
    }
  })
})
