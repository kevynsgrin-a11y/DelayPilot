/**
 * Card — a bounded surface: hairline, card radius, card fill.
 *
 * `break-inside: avoid` in print, because a segment card split across a page break in an evidence
 * packet is a defect (`DIRECTIVE.md §18.5`).
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'

export interface CardProps {
  readonly children: ReactNode
  /** The landmark or sectioning element this surface should be. */
  readonly as?: 'div' | 'section' | 'article' | 'li'
  /** `flat` drops the fill and keeps the hairline, for a card inside a card. */
  readonly variant?: 'raised' | 'flat'
  readonly className?: string
  readonly 'aria-labelledby'?: string
  readonly 'aria-label'?: string
}

export function Card({
  children,
  as = 'div',
  variant = 'raised',
  className,
  ...rest
}: CardProps): JSX.Element {
  const Tag = as
  return (
    <Tag className={cx('dp-card', `dp-card--${variant}`, className)} {...rest}>
      {children}
    </Tag>
  )
}
