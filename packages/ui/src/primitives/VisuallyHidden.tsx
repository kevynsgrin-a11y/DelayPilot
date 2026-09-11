/**
 * VisuallyHidden — text removed from the visual layer and kept for assistive technology.
 *
 * Not `display: none`, not `visibility: hidden`, not a zero-size box: those remove it from the
 * accessibility tree as well. The clip-path technique in primitives.css keeps it announced.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'

export interface VisuallyHiddenProps {
  readonly children: ReactNode
  readonly className?: string
  /** Render as a block-level element where inline would break the surrounding layout. */
  readonly as?: 'span' | 'div'
}

export function VisuallyHidden({
  children,
  className,
  as = 'span',
}: VisuallyHiddenProps): JSX.Element {
  const Tag = as
  return <Tag className={cx('dp-visually-hidden', className)}>{children}</Tag>
}
