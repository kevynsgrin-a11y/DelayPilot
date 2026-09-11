/**
 * Link — a navigation control.
 *
 * `newTab` opens a new browsing context with `rel="noopener noreferrer"`, AND announces that it
 * will. Opening a new tab with no warning is the single most common complaint in published
 * screen-reader surveys (`docs/ACCESSIBILITY.md` F17), so the prop that opens the tab is the same
 * prop that carries the announcement: there is no way to have one without the other. The string
 * itself is copy and comes from the caller, never from this primitive.
 *
 * It does NOT add `sponsored` or `nofollow`: an affiliate or sponsored link is a monetization
 * surface with its own disclosure rules (`AGENTS.md §4`) and belongs to
 * monetization-partnerships-engineer, not to a design primitive.
 */

import type { AnchorHTMLAttributes, JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'
import { VisuallyHidden } from './VisuallyHidden.tsx'

type NativeAnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'className' | 'children' | 'href' | 'rel' | 'target'
>

interface LinkBase extends NativeAnchorProps {
  readonly href: string
  readonly variant?: 'inline' | 'standalone'
  /**
   * Opens in a new tab, and the text that says so, e.g. "opens in a new tab". Rendered
   * VisuallyHidden after the label, so it is announced and does not crowd the page.
   */
  readonly newTab?: string
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
  const { children, href, variant = 'inline', newTab, iconOnly = false, className, ...rest } = props

  return (
    <a
      href={href}
      className={cx(
        'dp-link',
        `dp-link--${variant}`,
        iconOnly ? 'dp-link--icon-only' : undefined,
        className,
      )}
      {...(newTab === undefined ? {} : { rel: 'noopener noreferrer', target: '_blank' })}
      {...rest}
    >
      {children}
      {newTab === undefined ? null : <VisuallyHidden>{newTab}</VisuallyHidden>}
    </a>
  )
}
