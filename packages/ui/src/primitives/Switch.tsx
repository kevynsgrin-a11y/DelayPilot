/**
 * Switch — an immediate on/off control.
 *
 * `role="switch"` with `aria-checked`, operated by Space and Enter like any button. Use it only
 * where the change applies immediately (monitoring on, alerts on); a setting that needs saving is
 * a Checkbox in a form.
 *
 * The state is also written as text beside the track, so the position of a knob is never the only
 * way to read it.
 */

import type { ButtonHTMLAttributes, JSX } from 'react'
import { cx } from './class-names.ts'

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'children' | 'type' | 'role' | 'aria-checked' | 'onChange'
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
  return (
    <span className={cx('dp-switch', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className="dp-switch__control"
        onClick={() => {
          onCheckedChange(!checked)
        }}
        {...rest}
      >
        <span className="dp-switch__label">{label}</span>
        <span className="dp-switch__track" aria-hidden="true">
          <span className="dp-switch__knob" />
        </span>
        <span className="dp-switch__state">{stateLabel}</span>
      </button>
    </span>
  )
}
