/**
 * DelayPilot formatting. Owner: principal-architect.
 *
 * Formatting is settled here once so that no charter, review, or diff ever spends attention on it.
 */

/** @type {import("prettier").Config} */
export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' },
    },
    {
      // Markdown carries the directive, the charters, and the constitution. Reflowing prose
      // produces diffs that hide real edits, so preserve authored line breaks.
      files: ['*.md'],
      options: { proseWrap: 'preserve' },
    },
  ],
}
