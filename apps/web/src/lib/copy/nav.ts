/**
 * Navigation, layout chrome, and the strings assistive technology needs. Owner: `ux-copy-steward`.
 *
 * `nav.newTab` is the S2 handoff (`docs/BUILD_PLAN.md §10`, finding F17 in `docs/ACCESSIBILITY.md`).
 * `Link` with `external` sets `target="_blank"` and gives no warning that a new tab will open.
 * Every external link renders this string in a visually-hidden span INSIDE the link, so it lands in
 * the accessible name: "Council of the EU press release (opens in a new tab)". Lower case, no
 * leading capital, because it is a suffix to the link text and not a sentence of its own.
 */

export const nav = {
  /** The product name. Never "Delay Pilot", never "delaypilot" outside a URL. */
  brand: 'DelayPilot',

  /** First focusable element on every page. Must land on the `main` landmark. */
  skipLink: 'Skip to main content',

  /**
   * Visually-hidden suffix on every link that opens a new tab (F17). Rendered inside the link
   * element so it becomes part of the accessible name, never as a separate sibling.
   */
  newTab: 'opens in a new tab',

  /** `aria-current="page"` needs no text, but an icon-only current marker does. */
  currentPage: 'Current page',

  /** Accessible names for the mobile navigation toggle, by state. */
  menuOpen: 'Open menu',
  menuClose: 'Close menu',

  /** `aria-label` for each `nav` landmark. Two unlabeled `nav` elements are one landmark too many. */
  primaryLabel: 'Primary',
  footerLabel: 'Footer',

  header: {
    brand: 'DelayPilot',
    /** Top-level menu group labels. A group label is a button, not a link. */
    groups: {
      product: 'Product',
      passengerRights: 'Passenger rights',
      guides: 'Guides',
      methodology: 'Methodology',
      about: 'About',
    },
  },

  /** Item labels keyed by route path. The href is the frontend's; the words are here. */
  menus: {
    product: {
      '/flight-status/': 'Flight status',
      '/delay-risk/': 'Delay risk',
      '/connection-risk/': 'Connection risk',
      '/#demonstration': 'Try the demo',
    },
    passengerRights: {
      '/passenger-rights/': 'Overview',
      '/passenger-rights/us/': 'United States',
      '/passenger-rights/eu/': 'European Union',
      '/passenger-rights/uk/': 'United Kingdom',
      '/passenger-rights/canada/': 'Canada',
    },
  },

  footer: {
    groups: {
      product: 'Product',
      rights: 'Passenger rights',
      about: 'About DelayPilot',
      legal: 'Policies',
    },
    links: {
      '/flight-status/': 'Flight status',
      '/delay-risk/': 'Delay risk',
      '/connection-risk/': 'Connection risk',
      '/passenger-rights/': 'Passenger rights',
      '/guides/': 'Guides',
      '/methodology/': 'Methodology',
      '/data-sources/': 'Data sources',
      '/about/': 'About',
      '/accessibility/': 'Accessibility',
      '/contact/': 'Contact',
      '/privacy/': 'Privacy',
      '/terms/': 'Terms',
      '/affiliate-disclosure/': 'Affiliate disclosure',
      '/advertising-policy/': 'Advertising policy',
      '/editorial-policy/': 'Editorial policy',
    },
    demoHeading: 'Demonstration',
    /**
     * Shown where the Contact link would be when no contact address is configured. A link to a
     * page that cannot reach a person is a dead control (`AGENTS.md §1.6`), so the link is not
     * emitted at all — this sentence is for the Accessibility page, which must still say how to
     * report a barrier.
     */
    contactNotConfigured: 'No contact address is configured for this deployment.',
  },

  /** Theme control. A radio group, not a two-state toggle: "System" is a real third choice. */
  theme: {
    groupLabel: 'Theme',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },
} as const

/**
 * The footer copyright line.
 *
 * A function because a year written into a constant is a year that goes stale in January, and
 * because `new Date()` inside copy would make two builds of the same tree differ (`AGENTS.md §3.4`).
 * The caller passes the build year from configuration, so the output stays deterministic.
 */
export function copyright(year: number): string {
  return `© ${String(year)} ${nav.brand}`
}
