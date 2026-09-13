/**
 * The `DIRECTIVE.md §18.4` flight-lookup fields.
 *
 * Airline · flight number · date · optional endpoint disambiguation. That is the whole list, and
 * the list is the point:
 *
 *   THERE IS NO BOOKING-REFERENCE FIELD, AND THERE IS NO PLACE TO PUT ONE.
 *
 * Not as an input, a label, a placeholder, help text, an example, a `name`, an `autocomplete` hint,
 * a query parameter or a schema key (`AGENTS.md §2`). A flight number and a date identify a public
 * flight; anything printed on a ticket identifies a person's reservation, and this product has no
 * use for that. `DIRECTIVE.md §7` makes the absence a promise — "No booking code required" — which
 * is why the form states it rather than leaving a reader hunting for the field they were trained to
 * expect by claims sites.
 *
 * ALL FIELDS IN ONE REACT ROOT. `Field` generates its control, hint and error ids with `useId`, and
 * React restarts that counter per render root: two roots on one page would emit `_R_0_` twice, and
 * `aria-describedby` in the second would resolve to the first field's hint. One root per document,
 * asserted by the duplicate-id check in `apps/web/scripts/verify-dist.mjs`.
 *
 * THE AIRLINE FIELD IS THE `Combobox` SHELL WITH AN EMPTY OPTION SOURCE. Airline reference data is
 * Phase 3 (`data/airlines`), so there is nothing to list yet. The listbox therefore never opens —
 * `comboboxKeyDown` returns the state unchanged and does NOT consume the keystroke when
 * `optionIds` is empty — and the field behaves as the plain labelled text input it currently is.
 * The ARIA shell and the keyboard binding are wired now so that adding the option source later is
 * data, not a rewrite.
 *
 * NO ERROR IS RENDERED HERE. Validation happens in the browser, in the page's own module, which
 * writes the error into the `Field` markup contract using the control's own id. A server-rendered
 * error on a form nobody has submitted is a lie about what the reader has done.
 */

import type { JSX } from 'react'
import { Combobox, ComboboxListbox } from '../primitives/Combobox.tsx'
import { Field } from '../primitives/Field.tsx'
import { Input } from '../primitives/Input.tsx'

export interface FlightLookupFieldsCopy {
  readonly airlineLabel: string
  readonly airlineHint: string
  readonly airlineExample: string
  readonly flightNumberLabel: string
  readonly flightNumberHint: string
  readonly flightNumberExample: string
  readonly dateLabel: string
  readonly dateHint: string
  readonly originLabel: string
  readonly originHint: string
  readonly destinationLabel: string
  readonly destinationHint: string
  /** Accessible name for the airline popup. */
  readonly airlineListboxLabel: string
  /** The date field's own format note; it describes a shape rather than giving a value. */
  readonly dateExample: string
  readonly originExample: string
  readonly destinationExample: string
}

export interface FlightLookupFieldsProps {
  readonly copy: FlightLookupFieldsCopy
  /** Id of the airline listbox. Must be unique in the document. */
  readonly listboxId: string
}

/**
 * Help text plus a VISIBLE EXAMPLE, on its own line.
 *
 * `§18.4` asks for visible examples, and an example spliced into the end of the help sentence reads
 * as part of the instruction ("Name or code. Demo Airline"). It is also not a placeholder: a
 * placeholder disappears the moment a reader starts typing, which is exactly when they were about
 * to check it, and it is announced inconsistently.
 */
const hint = (help: string, example: string): JSX.Element => (
  <>
    {help}
    <span className="dpx-lookup__example">{example}</span>
  </>
)

export function FlightLookupFields({ copy, listboxId }: FlightLookupFieldsProps): JSX.Element {
  return (
    <div className="dpx-lookup__fields">
      <Field
        label={copy.airlineLabel}
        hint={hint(copy.airlineHint, copy.airlineExample)}
        required
        className="dpx-lookup__field"
      >
        {(control) => (
          <Combobox
            {...control}
            listboxId={listboxId}
            expanded={false}
            name="airline"
            autoComplete="off"
            data-dp-field="airline"
          >
            {/* Empty today: airline reference data is Phase 3. The listbox never opens empty. */}
            <ComboboxListbox id={listboxId} aria-label={copy.airlineListboxLabel} hidden>
              {null}
            </ComboboxListbox>
          </Combobox>
        )}
      </Field>

      <Field
        label={copy.flightNumberLabel}
        hint={hint(copy.flightNumberHint, copy.flightNumberExample)}
        required
        className="dpx-lookup__field"
      >
        {(control) => (
          <Input
            {...control}
            numeric
            name="flightNumber"
            inputMode="numeric"
            pattern="[0-9]{1,4}"
            maxLength={4}
            autoComplete="off"
            data-dp-field="flightNumber"
          />
        )}
      </Field>

      <Field
        label={copy.dateLabel}
        hint={hint(copy.dateHint, copy.dateExample)}
        required
        className="dpx-lookup__field dpx-lookup__field--wide"
      >
        {(control) => (
          <Input {...control} type="date" name="date" autoComplete="off" data-dp-field="date" />
        )}
      </Field>

      <Field
        label={copy.originLabel}
        hint={hint(copy.originHint, copy.originExample)}
        className="dpx-lookup__field"
      >
        {(control) => (
          <Input {...control} name="origin" autoComplete="off" data-dp-field="origin" />
        )}
      </Field>

      <Field
        label={copy.destinationLabel}
        hint={hint(copy.destinationHint, copy.destinationExample)}
        className="dpx-lookup__field"
      >
        {(control) => (
          <Input {...control} name="destination" autoComplete="off" data-dp-field="destination" />
        )}
      </Field>
    </div>
  )
}
