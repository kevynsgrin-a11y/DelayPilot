/**
 * Input — a single-line text control.
 *
 * `numeric` switches on tabular figures. It is not decorative: a flight number, a countdown or a
 * slack value that reflows as its digits change is a value the reader has to re-find.
 *
 * There is deliberately no `type="password"` convenience and no booking-reference affordance:
 * `AGENTS.md §2` bars a PNR field anywhere in the launch experience.
 */

import type { InputHTMLAttributes, JSX } from 'react'
import { cx } from './class-names.ts'

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'size'
> {
  readonly numeric?: boolean
  readonly className?: string
}

export function Input({
  numeric = false,
  className,
  type = 'text',
  ...rest
}: InputProps): JSX.Element {
  return (
    <input
      type={type}
      className={cx('dp-input', numeric ? 'tnum' : undefined, className)}
      {...rest}
    />
  )
}
