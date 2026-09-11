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
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'

import { AdSlot } from '../src/primitives/AdSlot.tsx'
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
import { Icon, iconNames } from '../src/primitives/Icon.tsx'
import { Input } from '../src/primitives/Input.tsx'
import { Link } from '../src/primitives/Link.tsx'
import { ProgressBar } from '../src/primitives/ProgressBar.tsx'
import { ProvenanceChip } from '../src/primitives/ProvenanceChip.tsx'
import { Radio } from '../src/primitives/Radio.tsx'
import { Select } from '../src/primitives/Select.tsx'
import { Skeleton } from '../src/primitives/Skeleton.tsx'
import { Stack } from '../src/primitives/Stack.tsx'
import { StatusPill } from '../src/primitives/StatusPill.tsx'
import { Switch } from '../src/primitives/Switch.tsx'
import { Tabs } from '../src/primitives/Tabs.tsx'
import { Toast } from '../src/primitives/Toast.tsx'
import { Tooltip } from '../src/primitives/Tooltip.tsx'
import { VisuallyHidden } from '../src/primitives/VisuallyHidden.tsx'
import {
  interimProvenanceKinds,
  interimSeverities,
  interimStatusTones,
  provenanceLabels,
} from '../src/tokens/interim-contracts.ts'

const html = (element: ReactElement): string => renderToStaticMarkup(element)

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

  it('adds rel and target only when external, and never adds sponsored', () => {
    const external = html(
      <Link href="https://example.org/rule" external>
        Official source
      </Link>,
    )
    expect(external).toContain('rel="noopener noreferrer"')
    expect(external).toContain('target="_blank"')
    expect(external).not.toContain('sponsored')
    expect(html(<Link href="/terms/">Terms</Link>)).not.toContain('target=')
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

  it('takes its gap from the spacing scale', () => {
    expect(html(<Stack gap={24}>row</Stack>)).toContain('gap:var(--space-24)')
  })

  it('publishes the 8 + 4 cockpit split', () => {
    const markup = html(
      <Grid variant="cockpit">
        <GridArea area="primary">itinerary</GridArea>
        <GridArea area="secondary">sources</GridArea>
      </Grid>,
    )
    expect(markup).toContain('dp-grid--cockpit')
    expect(markup).toContain('dp-grid__primary')
    expect(markup).toContain('dp-grid__secondary')
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
})

describe('Checkbox, Radio, Switch', () => {
  it('keeps a native input behind the drawn control', () => {
    expect(html(<Checkbox name="alerts">Email alerts</Checkbox>)).toContain('type="checkbox"')
    expect(html(<Radio name="mode">Self-transfer</Radio>)).toContain('type="radio"')
  })

  it('marks a mixed checkbox as mixed', () => {
    expect(html(<Checkbox indeterminate>Some</Checkbox>)).toContain('aria-checked="mixed"')
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
})

describe('Skeleton, ProgressBar, AdSlot', () => {
  it('reserves the final dimensions and announces what is loading', () => {
    const markup = html(<Skeleton width="12rem" height="1.5rem" label="Loading flight status" />)
    expect(markup).toContain('inline-size:12rem')
    expect(markup).toContain('block-size:1.5rem')
    expect(markup).toContain('Loading flight status')
  })

  it('is a linear meter with a text value, never a gauge', () => {
    const markup = html(
      <ProgressBar
        value={18}
        max={45}
        band="watch"
        label="Connection slack"
        valueText="18 of 45 minutes"
      />,
    )
    expect(markup).toContain('role="progressbar"')
    expect(markup).toContain('aria-valuenow="18"')
    expect(markup).toContain('aria-valuemax="45"')
    expect(markup).toContain('aria-valuetext="18 of 45 minutes"')
    expect(markup).toContain('dp-progress--watch')
    expect(markup).not.toMatch(/gauge|speedometer|dial|needle/i)
  })

  it('clamps out-of-range readings instead of overflowing the track', () => {
    expect(html(<ProgressBar value={120} label="x" valueText="full" />)).toContain(
      'aria-valuenow="100"',
    )
  })

  it('reserves and labels an ad slot, and drops it from print', () => {
    const markup = html(<AdSlot label="Advertisement" width="300px" height="250px" />)
    expect(markup).toContain('aria-label="Advertisement"')
    expect(markup).toContain('inline-size:300px')
    expect(markup).toContain('block-size:250px')
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
})
