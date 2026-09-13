/**
 * Radio — a native radio with a drawn dial.
 *
 * Grouping is the caller's: a set of radios belongs inside a `fieldset` with a `legend`, which is
 * a layout and copy decision, not a primitive one.
 */

import type { InputHTMLAttributes, JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'
import { withoutInlineStyle } from './no-inline-style.ts'

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'children' | 'type' | 'style'
> {
  readonly children: ReactNode
  readonly className?: string
}

export function Radio({ children, className, ...rest }: RadioProps): JSX.Element {
  return (
    <label className={cx('dp-choice', 'dp-choice--radio', className)}>
      <input type="radio" className="dp-choice__input" {...withoutInlineStyle(rest)} />
      <span className="dp-choice__box" aria-hidden="true">
        <span className="dp-choice__dial" />
      </span>
      <span className="dp-choice__label">{children}</span>
    </label>
  )
}
