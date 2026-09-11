/**
 * DataTable — a real table.
 *
 * Real `th` with real `scope`, a caption, and tabular figures on every numeric column, because a
 * column of times whose digits change width is a column that moves while it is being read.
 *
 * Columns declare `numeric` rather than the primitive guessing: whether a value is a quantity is a
 * fact about the datum, and a primitive that inspected the data would be deciding it.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'

export interface DataTableColumn<Row> {
  readonly key: string
  readonly header: ReactNode
  /** Tabular figures and end alignment: times, flight numbers, durations, distances, amounts. */
  readonly numeric?: boolean
  /** Marks this cell as the row header (`th scope="row"`). At most one column should set it. */
  readonly rowHeader?: boolean
  readonly cell: (row: Row) => ReactNode
}

export interface DataTableProps<Row> {
  readonly columns: readonly DataTableColumn<Row>[]
  readonly rows: readonly Row[]
  readonly rowKey: (row: Row) => string
  /** Visible caption naming the table. Required: a table with no name is a table you cannot skip. */
  readonly caption: ReactNode
  readonly className?: string
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
  className,
}: DataTableProps<Row>): JSX.Element {
  return (
    <div className={cx('dp-table', className)}>
      <table className="dp-table__table">
        <caption className="dp-table__caption">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cx(
                  'dp-table__head',
                  column.numeric === true ? 'dp-table__cell--numeric tnum' : undefined,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) =>
                column.rowHeader === true ? (
                  <th
                    key={column.key}
                    scope="row"
                    className={cx(
                      'dp-table__cell',
                      'dp-table__cell--row-header',
                      column.numeric === true ? 'dp-table__cell--numeric tnum' : undefined,
                    )}
                  >
                    {column.cell(row)}
                  </th>
                ) : (
                  <td
                    key={column.key}
                    className={cx(
                      'dp-table__cell',
                      column.numeric === true ? 'dp-table__cell--numeric tnum' : undefined,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
