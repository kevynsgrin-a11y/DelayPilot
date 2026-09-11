/**
 * Field — label, hint and error for exactly one control.
 *
 * The control is supplied as a render function so that the wiring is impossible to get wrong: the
 * primitive owns the ids and hands back `id`, `aria-describedby` and `aria-invalid` already
 * resolved. A field with a hint and an error describes both, in reading order.
 *
 * The error is rendered as text next to the control, not as a colour change: an input that turned
 * red and said nothing would be colour-as-the-only-signal.
 */

import { useId, type JSX, type ReactNode } from 'react'
import { cx } from './class-names.ts'

export interface FieldControlProps {
  readonly id: string
  readonly 'aria-describedby': string | undefined
  readonly 'aria-invalid': true | undefined
  readonly required: boolean | undefined
}

export interface FieldProps {
  readonly label: ReactNode
  readonly children: (control: FieldControlProps) => ReactNode
  readonly hint?: ReactNode
  /** Present means invalid. The string is the message; there is no separate boolean. */
  readonly error?: string
  readonly required?: boolean
  /** Visible text marking the field optional or required. Copy is the caller's. */
  readonly requirementNote?: string
  readonly className?: string
}

export function Field({
  label,
  children,
  hint,
  error,
  required,
  requirementNote,
  className,
}: FieldProps): JSX.Element {
  const base = useId()
  const id = `${base}-control`
  const hintId = `${base}-hint`
  const errorId = `${base}-error`

  const describedBy = [
    hint === undefined ? undefined : hintId,
    error === undefined ? undefined : errorId,
  ]
    .filter((value): value is string => value !== undefined)
    .join(' ')

  return (
    <div
      className={cx('dp-field', error === undefined ? undefined : 'dp-field--invalid', className)}
    >
      <label className="dp-field__label" htmlFor={id}>
        {label}
        {requirementNote === undefined ? null : (
          <span className="dp-field__requirement">{requirementNote}</span>
        )}
      </label>
      {hint === undefined ? null : (
        <p className="dp-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {children({
        id,
        'aria-describedby': describedBy.length > 0 ? describedBy : undefined,
        'aria-invalid': error === undefined ? undefined : true,
        required,
      })}
      {error === undefined ? null : (
        <p className="dp-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
