/**
 * Checkbox — a native input with a drawn box.
 *
 * The native input stays in the DOM, focusable and announced; the drawn box is decoration on top
 * of it. `indeterminate` is set imperatively because it is a DOM property with no HTML attribute.
 */

import { useEffect, useRef, type InputHTMLAttributes, type JSX, type ReactNode } from 'react'
import { cx } from './class-names.ts'
import { Icon } from './Icon.tsx'
import { withoutInlineStyle } from './no-inline-style.ts'

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'children' | 'type' | 'style'
> {
  readonly children: ReactNode
  readonly indeterminate?: boolean
  readonly className?: string
}

export function Checkbox({
  children,
  indeterminate = false,
  className,
  ...rest
}: CheckboxProps): JSX.Element {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <label className={cx('dp-choice', className)}>
      <input
        ref={ref}
        type="checkbox"
        className="dp-choice__input"
        {...(indeterminate ? { 'aria-checked': 'mixed' as const } : {})}
        {...withoutInlineStyle(rest)}
      />
      <span className="dp-choice__box" aria-hidden="true">
        <Icon name={indeterminate ? 'minus' : 'check'} decorative className="dp-choice__mark" />
      </span>
      <span className="dp-choice__label">{children}</span>
    </label>
  )
}
