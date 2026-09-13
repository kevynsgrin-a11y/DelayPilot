/**
 * Select — the native control, styled.
 *
 * Native on purpose: it is the only select that gets platform keyboard behaviour, platform
 * screen-reader behaviour and a platform picker on a phone at a gate, for free and correctly.
 */

import type { JSX, ReactNode, SelectHTMLAttributes } from 'react'
import { cx } from './class-names.ts'
import { Icon } from './Icon.tsx'
import { withoutInlineStyle } from './no-inline-style.ts'

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'className' | 'children' | 'style'
> {
  readonly children: ReactNode
  readonly className?: string
}

export function Select({ children, className, ...rest }: SelectProps): JSX.Element {
  return (
    <span className="dp-select">
      <select className={cx('dp-select__control', className)} {...withoutInlineStyle(rest)}>
        {children}
      </select>
      <Icon name="chevron-down" decorative className="dp-select__chevron" />
    </span>
  )
}
