# Provider Licensing

**Owner:** `regulatory-source-steward` (`docs/agents/ROSTER.md §3`).
**Status:** scaffold — **no provider is licensed, and therefore no live provider may be enabled.**

This file is the licence record that `AGENTS.md §1.5` and `DIRECTIVE.md §13` require before any
live flight, weather, or airspace adapter may serve data in production. It exists so that the
fail-closed rule has something concrete to fail against: an adapter whose provider has no completed
section below must not be activated, and `FLIGHT_PROVIDER` must remain `fixture`.

> Created as a scaffold under direct owner instruction after an external audit found this file
> referenced by `.env.example`, `docs/BUILD_PLAN.md §7`, and the `regulatory-source-steward` charter
> but absent from the repository. **Nothing in it has been filled in, because the terms must come
> from a real, currently-valid contract read at the time of activation — not from an audit, not from
> a vendor's marketing page, and not from training memory (`AGENTS.md §5.1`).**

---

## 1. The rule this file enforces

`AGENTS.md §1.5`, verbatim:

> Missing credentials, missing licence policy, unapproved provider, unverified source, expired rule
> set, or unavailable model ⇒ degrade to a designed, labelled state. Never substitute fixture data
> for live data at runtime outside explicit demo mode. Production readiness must fail rather than
> silently serve fixtures.

Two independent gates must both pass before a provider goes live. A credential alone is **not**
sufficient:

1. **Credential present** — the relevant key/secret from `.env.example` is set as a Wrangler secret.
2. **Licence recorded and reviewed** — a completed section below, signed off by
   `regulatory-source-steward`, confirming the contract actually permits the intended use.

`ProviderLicensePolicy` (Phase 4, `packages/providers`) reads this record. A provider missing from
this file is treated as unapproved and fails closed.

## 2. Required fields per provider

Every provider section must answer all of the following. "Unknown" is a valid answer and blocks
activation; a guess is not.

| Field                  | What it must record                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider and product   | Exact commercial product name and tier, not the company name alone.                                                                                   |
| Contract reference     | Agreement identifier and effective/expiry dates.                                                                                                      |
| Consumer display       | Whether B2C display to end users is permitted, and any attribution wording required.                                                                  |
| Caching                | Maximum permitted cache duration, and whether caching is permitted at all.                                                                            |
| Persistence            | Whether responses may be stored, and whether raw payloads may be retained (this governs `flight_status_snapshots.raw_payload` in `DIRECTIVE.md §12`). |
| Derivative use         | Whether normalized or derived values (delay bands, risk inputs) may be stored or displayed.                                                           |
| Redistribution         | Whether data may be shown to unauthenticated users, exported, or included in notifications.                                                           |
| Rate and volume limits | Contractual limits, distinct from technical rate limits.                                                                                              |
| Reviewer and date      | Who verified these terms against the live contract, and when.                                                                                         |

## 3. Provider records

### 3.1 FlightAware AeroAPI

**Status: not licensed. Adapter must fail closed.**
Credential variable: `AEROAPI_KEY`. No contract exists. No section fields completed.

### 3.2 Cirium

**Status: not licensed. Adapter must fail closed.**
Credential variables: `CIRIUM_CLIENT_ID`, `CIRIUM_CLIENT_SECRET`. No contract exists.

### 3.3 OAG

**Status: not licensed. Adapter must fail closed.**
Credential variable: `OAG_API_KEY`. No contract exists.

### 3.4 AviationWeather.gov (NOAA/NWS Aviation Weather Center)

**Status: no commercial licence required, but terms not yet verified by the owning agent.**

This is a US government public data API requiring no key. `.env.example` already requires an
identifying `AVIATIONWEATHER_USER_AGENT` contact string, and `DIRECTIVE.md` Phase 4 requires 204
handling, a product-appropriate TTL, a parser version, and a checksum for this adapter. Whatever
rate guidance the service publishes must be read and respected by the reliability layer; it has not
been read, so no rate figure is recorded here. Before enabling it in production,
`regulatory-source-steward` must read the current terms of use and rate guidance at the canonical
source and complete this section — public availability is not the same as verified terms.

_Correction, 2026-09-12:_ the previous revision of this paragraph cited `DIRECTIVE.md §11.1` for the
User-Agent requirement, as `.env.example:70` still does. That citation does not resolve —
`DIRECTIVE.md` ends at §33 and has no §11.1. The requirement itself is real and lives in
`.env.example`. Recorded as finding R-5 in `docs/RIGHTS_SOURCE_REVIEW.md`.

### 3.5 FAA NAS Status

**Status: terms not yet verified by the owning agent.** Public US government source; same
requirement as §3.4 — verified before use, not assumed.

### 3.6 OpenSky Network

**Status: not licensed, and a written licence is required before any operational use.**

Recorded here because it is easy to mistake for a freely usable API. OpenSky's published terms
require written permission for commercial/for-profit use **and** separately for operational use in
any live product or automated system, regardless of the operator's status. It must clear the same
gate as any paid provider.

## 4. Adding a provider

1. Obtain the contract. Read the current executed terms, not a summary or a prior version.
2. Complete every field in §2 for that provider in a new subsection of §3.
3. `regulatory-source-steward` reviews and records reviewer name and date.
4. Register the provider in `ProviderLicensePolicy` so the guard can read it.
5. Set the credential as a Wrangler secret.
6. Enable in a non-production environment first, and verify the adapter fails closed when the
   credential is removed.

Removing or expiring a licence reverses this: the provider is disabled first, then the record is
updated with the end date. A record is never deleted — an expired licence is part of the audit
trail.

## 5. Verification attempts

A dated log of every attempt to complete a section above, successful or not, so that "not yet
verified" can never be confused with "not yet attempted".

| Date       | Sections attempted                                               | Outcome                                                                                                                                                                                                                                    |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-09-12 | §3.1 FlightAware AeroAPI, §3.4 AviationWeather.gov, §3.5 FAA NAS | **Blocked (external).** `WebFetch` to `www.flightaware.com`, `aviationweather.gov`, and `nasstatus.faa.gov` each returned `EGRESS_BLOCKED: Access to <host> is blocked by the network egress proxy.` Nothing was read; no section changed. |

Detail, remedies, and the full 22-source cycle are in `docs/RIGHTS_SOURCE_REVIEW.md` (cycle
2026-09-12). §3.1 would not have changed in any case: an executed agreement, not a vendor page, is
what moves a provider to `licensed`.
