/** Absolute paths to the generated artifacts, resolved from this file rather than from cwd. */
import { fileURLToPath } from 'node:url'

export const STYLESHEET_PATH = fileURLToPath(
  new URL('../../../apps/web/src/styles/tokens.css', import.meta.url),
)

export const CONTRAST_TABLE_PATH = fileURLToPath(
  new URL('../src/tokens/CONTRAST.md', import.meta.url),
)
