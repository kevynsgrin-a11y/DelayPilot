/**
 * Link — a navigation control.
 *
 * `external` adds `rel="noopener noreferrer"` and a new browsing context. It does NOT add
 * `sponsored` or `nofollow`: an affiliate or sponsored link is a monetization surface with its own
 * disclosure rules (`AGENTS.md §4`) and belongs to monetization-partnerships-engineer, not to a
 * design primitive.
 */

import type { AnchorHTMLAttributes, JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'

type NativeAnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'className' | 'children' | 'href' | 'rel' | 'target'
>

interface LinkBase extends NativeAnchorProps {
  readonly href: string
  readonly variant?: 'inline' | 'standalone'
  readonly external?: boolean
  readonly className?: string
}

interface LabelledLink extends LinkBase {
  readonly children: ReactNode
  readonly iconOnly?: false
}

interface IconOnlyLink extends LinkBase {
  readonly children: ReactNode
  readonly iconOnly: true
  readonly 'aria-label': string
}

export type LinkProps = LabelledLink | IconOnlyLink

export function Link(props: LinkProps): JSX.Element {
  const {
    children,
    href,
    variant = 'inline',
    external = false,
    iconOnly = false,
    className,
    ...rest
  } = props

  return (
    <a
      href={href}
      className={cx(
        'dp-link',
        `dp-link--${variant}`,
        iconOnly ? 'dp-link--icon-only' : undefined,
        className,
      )}
      {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
      {...rest}
    >
      {children}
    </a>
  )
}
