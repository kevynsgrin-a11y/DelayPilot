/**
 * Switch — an immediate on/off control.
 *
 * `role="switch"` with `aria-checked`, operated by Space and Enter like any button. Use it only
 * where the change applies immediately (monitoring on, alerts on); a setting that needs saving is
 * a Checkbox in a form.
 *
 * The state is also written as text beside the track, so the position of a knob is never the only
 * way to read it — but that word is deliberately OUTSIDE the accessible name. Naming the control
 * from its contents would make the name "Monitoring On", then "Monitoring Off": the state announced
 * twice, and a name that mutates on toggle, which some screen readers report as a name change
 * rather than a state change (`docs/ACCESSIBILITY.md` F8). The state belongs to `aria-checked`.
 */

import { useId, type ButtonHTMLAttributes, type JSX } from 'react'
import { cx } from './class-names.ts'

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'className'
  | 'children'
  | 'type'
  | 'role'
  | 'aria-checked'
  | 'aria-label'
  | 'aria-labelledby'
  | 'onChange'
> {
  readonly checked: boolean
  readonly onCheckedChange: (checked: boolean) => void
  /** Visible label text. Sits beside the track and is referenced as the accessible name. */
  readonly label: string
  /** Visible state text, e.g. "On" / "Off". Supplied by the caller: state strings are copy. */
  readonly stateLabel: string
  readonly className?: string
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  stateLabel,
  className,
  ...rest
}: SwitchProps): JSX.Element {
  const labelId = useId()

  return (
    <span className={cx('dp-switch', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        className="dp-switch__control"
        onClick={() => {
          onCheckedChange(!checked)
        }}
        {...rest}
      >
        <span className="dp-switch__label" id={labelId}>
          {label}
        </span>
        <span className="dp-switch__track" aria-hidden="true">
          <span className="dp-switch__knob" />
        </span>
        <span className="dp-switch__state">{stateLabel}</span>
      </button>
    </span>
  )
}
