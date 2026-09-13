/**
 * Stack — one-dimensional layout on the spacing scale.
 *
 * Gap is restricted to the scale at the type level, so no surface can invent a 13px rhythm.
 *
 * Every layout choice is a DATA ATTRIBUTE over a finite set, resolved by a rule in primitives.css.
 * The gap used to be an inline `style`, which the served Content-Security-Policy (`style-src 'self'`
 * with no `'unsafe-inline'`, apps/web/public/_headers) discards — so on the real site every Stack
 * collapsed to the browser default gap of zero. See no-inline-style.ts.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'

export type SpaceStep = 2 | 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64 | 96

export interface StackProps {
  readonly children: ReactNode
  readonly direction?: 'column' | 'row'
  readonly gap?: SpaceStep
  readonly align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  readonly justify?: 'start' | 'center' | 'end' | 'between'
  readonly wrap?: boolean
  readonly className?: string
}

export function Stack({
  children,
  direction = 'column',
  gap = 16,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
}: StackProps): JSX.Element {
  return (
    <div
      className={cx('dp-stack', className)}
      data-direction={direction}
      data-gap={gap}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? 'true' : undefined}
    >
      {children}
    </div>
  )
}
