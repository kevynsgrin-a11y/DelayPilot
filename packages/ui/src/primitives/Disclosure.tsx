/**
 * Disclosure — expandable detail, built on `details`/`summary`.
 *
 * Native because the native element already carries the role, the expanded state, keyboard
 * operation and find-in-page expansion, and because the alternative — animating a height — is an
 * animated layout property, which is forbidden everywhere (`DIRECTIVE.md §7`, ADR 0003 rule 3).
 * The marker rotates on `transform` at `--motion-fast`; nothing else moves.
 *
 * `DIRECTIVE.md §18.5` asks for answer-first cards with expandable reasoning: the summary is the
 * answer, the content is the reasoning. Never hide a fact a traveler needs to act on in here.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'
import { Icon } from './Icon.tsx'

export interface DisclosureProps {
  readonly summary: ReactNode
  readonly children: ReactNode
  readonly defaultOpen?: boolean
  /** Groups disclosures so that opening one closes the others. Native `name` on `details`. */
  readonly name?: string
  readonly className?: string
}

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  name,
  className,
}: DisclosureProps): JSX.Element {
  return (
    <details
      className={cx('dp-disclosure', className)}
      open={defaultOpen}
      {...(name === undefined ? {} : { name })}
    >
      <summary className="dp-disclosure__summary">
        <Icon name="chevron-down" decorative className="dp-disclosure__marker" />
        <span>{summary}</span>
      </summary>
      <div className="dp-disclosure__content">{children}</div>
    </details>
  )
}
