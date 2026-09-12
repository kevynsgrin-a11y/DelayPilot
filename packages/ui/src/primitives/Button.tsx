/**
 * Button — the system's action control.
 *
 * Minimum 44x44px target (`DIRECTIVE.md §18.7`), visible focus ring from the shared focus layer,
 * and an accessible name enforced at the type level: an icon-only button cannot be constructed
 * without `aria-label`, because the union below has no branch that permits it.
 *
 * `type` defaults to `button`. A primitive that defaulted to `submit` would make every button
 * inside a form a submit button by accident — which, in a product where the wrong click costs a
 * traveler money, is not a stylistic preference.
 */

import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'
import { withoutInlineStyle } from './no-inline-style.ts'

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'children' | 'style'
>

interface ButtonBase extends NativeButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'ghost'
  /** Fills the inline axis. Used for the primary action on a 375px viewport. */
  readonly block?: boolean
  readonly className?: string
}

interface LabelledButton extends ButtonBase {
  readonly children: ReactNode
  readonly iconOnly?: false
}

/** An icon-only control has no visible text, so the accessible name is mandatory. */
interface IconOnlyButton extends ButtonBase {
  readonly children: ReactNode
  readonly iconOnly: true
  readonly 'aria-label': string
}

export type ButtonProps = LabelledButton | IconOnlyButton

export function Button(props: ButtonProps): JSX.Element {
  const {
    children,
    variant = 'primary',
    block = false,
    iconOnly = false,
    className,
    type = 'button',
    ...rest
  } = props

  return (
    <button
      type={type}
      className={cx(
        'dp-button',
        `dp-button--${variant}`,
        block ? 'dp-button--block' : undefined,
        iconOnly ? 'dp-button--icon-only' : undefined,
        className,
      )}
      {...withoutInlineStyle(rest)}
    >
      {children}
    </button>
  )
}
