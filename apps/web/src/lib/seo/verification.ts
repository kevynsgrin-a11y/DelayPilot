/**
 * Search Console and Bing Webmaster Tools site verification. Owner: `seo-engineer`.
 *
 * WHAT THIS IS FOR. Both tools accept a meta tag in the home page's `<head>` as proof that whoever
 * added it controls the site. The token is not a secret — it is public by construction, since a
 * crawler has to read it — but it is an arbitrary string from a third party, so it is validated
 * here before it can reach an attribute: a value carrying a quote or an angle bracket would break
 * out of the attribute it is written into.
 *
 * NEITHER TAG SHIPS TODAY. `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` are empty in
 * `.env.example` and unset in the deployment, so both resolve to `undefined` and the layout emits
 * nothing. An empty or invented token is worse than no tag: verification fails, and the failure is
 * silent until somebody opens the console weeks later.
 *
 * DNS IS THE BETTER ROUTE WHERE THE OWNER HOLDS THE ZONE. A TXT record verifies every protocol and
 * subdomain of a property at once and survives a redeploy that loses an environment variable. These
 * variables exist for the case where the DNS zone is not reachable; `docs/SEO.md §10` records both.
 */

/**
 * A token may be written into an HTML attribute, so it may not contain anything that ends one.
 * Length bounds are deliberately wide: Google's token is 43 characters today and Bing's is 32, and
 * neither is a documented, stable format to pin.
 */
const TOKEN = /^[A-Za-z0-9_\-.:=]{8,128}$/

export function normalizeVerificationToken(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const token = value.trim()
  if (token === '') return undefined
  return TOKEN.test(token) ? token : undefined
}

/** Why a configured token was refused, for a build log. `undefined` when there is nothing wrong. */
export function verificationTokenProblem(name: string, value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined
  return normalizeVerificationToken(value) === undefined
    ? `${name} is set but is not a usable token: expected 8 to 128 characters of A-Z, a-z, 0-9, "_", "-", ".", ":" or "=". A token with a quote or an angle bracket in it would break the attribute it is written into.`
    : undefined
}

const google: unknown = import.meta.env['GOOGLE_SITE_VERIFICATION']
const bing: unknown = import.meta.env['BING_SITE_VERIFICATION']

/** `<meta name="google-site-verification" content="…">`, or `undefined` when unconfigured. */
export const googleSiteVerification: string | undefined = normalizeVerificationToken(google)

/** `<meta name="msvalidate.01" content="…">`, or `undefined` when unconfigured. */
export const bingSiteVerification: string | undefined = normalizeVerificationToken(bing)

/** Problems with configured-but-unusable tokens, for the build log. Empty when all is well. */
export const verificationProblems: readonly string[] = [
  verificationTokenProblem('GOOGLE_SITE_VERIFICATION', google),
  verificationTokenProblem('BING_SITE_VERIFICATION', bing),
].filter((problem): problem is string => problem !== undefined)
