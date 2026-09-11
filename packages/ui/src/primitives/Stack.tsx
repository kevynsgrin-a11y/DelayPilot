/**
 * Stack — one-dimensional layout on the spacing scale.
 *
 * Gap is restricted to the scale at the type level, so no surface can invent a 13px rhythm.
 */

import type { CSSProperties, JSX, ReactNode } from 'react'
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
  readonly style?: CSSProperties
}

export function Stack({
  children,
  direction = 'column',
  gap = 16,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  style,
}: StackProps): JSX.Element {
  return (
    <div
      className={cx(
        'dp-stack',
        `dp-stack--${direction}`,
        `dp-stack--align-${align}`,
        `dp-stack--justify-${justify}`,
        wrap ? 'dp-stack--wrap' : undefined,
        className,
      )}
      style={{ ...style, gap: `var(--space-${String(gap)})` }}
    >
      {children}
    </div>
  )
}
