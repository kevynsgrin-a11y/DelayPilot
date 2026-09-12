# `data/rights/sources` — the primary-source registry

**Owner:** `regulatory-source-steward` (`docs/agents/ROSTER.md §3`). No other agent writes this
directory. `rights-rules-engineer` reads it; `trust-compliance-officer` reviews it.

`registry.json` is the seed for the `source_registry` table in `DIRECTIVE.md §12` and the list
`DIRECTIVE.md §33` requires. It is the only place a rule value's provenance may come from: if a
number, threshold, amount, or date in `data/rights/rulesets/**` does not resolve to an `active`
record here, that rule set may not be published.

**Current state (2026-09-12): nothing in this file has been verified.** All 27 records are
`status: "unreachable"` with `lastVerifiedAt: null`, because the build environment's network egress
policy denied every fetch. See `docs/RIGHTS_SOURCE_REVIEW.md` for the cycle and the two remedies.

---

## 1. Record shape

`DIRECTIVE.md §12` columns, plus the three fields marked _(local)_ that this repository adds.

| Field                  | Meaning                                                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                   | Stable citation key. Other agents hard-code these; renaming one is a breaking change.                                                                             |
| `authority`            | The body that published it, named as it names itself.                                                                                                             |
| `jurisdiction`         | `US` · `EU` · `UK` · `CA` · `international` · `not_applicable` (vendor and platform documentation).                                                               |
| `canonicalUrl`         | The URL actually opened. A redirect to a new URL is a finding: update this field and note the move.                                                               |
| `type`                 | `statute` · `regulation` · `regulator_guidance` · `enforcement_notice` · `voluntary_commitment` · `treaty` · `provider_docs` · `platform_docs` · `press_release`. |
| `evidenceClass`        | _(local)_ `primary` or `secondary`. A `secondary` record is never the source behind a rule value.                                                                 |
| `citableForRuleValues` | _(local)_ Whether a `sourceIds` entry in a rule set may name this id at all.                                                                                      |
| `publishedDate`        | The date the page states for itself. `null` until read — never inferred from a URL path.                                                                          |
| `effectiveDate`        | When the instrument takes legal effect, with the arithmetic recorded in the review log. `null` until computed.                                                    |
| `lastVerifiedAt`       | UTC instant of a fetch in which the relied-on provision was read. `null` means never opened.                                                                      |
| `nextReviewDue`        | `lastVerifiedAt` + `reviewIntervalDays`. `null` until a first verification exists.                                                                                |
| `reviewIntervalDays`   | _(local)_ `30` in flux · `90` stable regulator guidance · `180` platform and provider documentation.                                                              |
| `checksum`             | SHA-256 of the normalized fetched text, or `null` where a dated quoted provision is the artifact instead.                                                         |
| `etag`                 | The response `ETag` where the server sends a usable one.                                                                                                          |
| `status`               | `active` · `superseded` · `withdrawn` · `unreachable`.                                                                                                            |
| `lastFetchAttemptAt`   | _(local)_ When a fetch was last attempted, successful or not. Distinguishes "tried and failed" from "never tried".                                                |
| `lastFetchOutcome`     | _(local)_ The verbatim HTTP or tool outcome of that attempt.                                                                                                      |
| `notes`                | What the record is relied on for, the constraints that attach to it, and the last fetch outcome.                                                                  |

### Two extensions, proposed 2026-09-12 and ratified the same day

1. **`press_release` is the ninth `type`.** The charter originally enumerated eight, and a
   legislative-process announcement is none of them. Filing the Council press release under
   `regulator_guidance` would dress a secondary document as a regulator's guidance, which is the
   exact confusion this registry exists to prevent. Ratified by `build-orchestrator` on 2026-09-12
   and defined as always `evidenceClass: "secondary"` and `citableForRuleValues: false`.
2. **Local fields.** `evidenceClass` and `citableForRuleValues` make "never publish on a secondary
   source" mechanical instead of advisory, and are now charter fields. `lastFetchAttemptAt` /
   `lastFetchOutcome` keep a failed fetch visible; without them, a blocked cycle is
   indistinguishable from an idle one.

## 2. When a rule value may cite a record

All five, at the moment of publication:

1. `citableForRuleValues` is `true` — platform, vendor, weather, airspace, and statistics records
   are `false`; they describe systems, not law.
2. `status` is `active`.
3. `lastVerifiedAt` is not `null` and is not past `nextReviewDue`.
4. The provision relied on is quoted in a dated `docs/RIGHTS_SOURCE_REVIEW.md` entry.
5. **The pair rule** (`DIRECTIVE.md §33`): a legal value, threshold, band, or effective date cites
   **both** an instrument-level record and the regulator explanation that interprets it. An
   explanation alone is not a source for a legal value, and an instrument read without the
   regulator's interpretation is how a plain-text reading becomes a confident error.

| Jurisdiction | Instrument record      | Explanation record                                               |
| ------------ | ---------------------- | ---------------------------------------------------------------- |
| EU           | `eu-reg-261-2004`      | `eu-your-europe-air`                                             |
| UK           | `uk-reg-261-2004`      | `uk-caa-delays`                                                  |
| Canada       | `ca-appr-sor-2019-150` | `cta-delays-cancellations`, `cta-rebooking-refunds-compensation` |
| US refunds   | `us-14cfr-260`         | `dot-refunds` (+ `dot-whats-new` as guidance annotation)         |
| US oversales | `us-14cfr-250`         | `dot-refunds`                                                    |

The EU reform has no instrument record yet: its Official Journal citation does not exist in the
registry, which is why `effectiveFrom` is `null` and the reform is `adopted_not_effective`.

13 records are marked citable; none satisfies conditions 2–4 today, so no rule value may cite
anything at present.

## 3. Verification procedure (every source, every cycle)

1. **Open it.** Fetch `canonicalUrl` and record the HTTP outcome verbatim in `lastFetchOutcome`. A
   redirect is a finding, not a convenience.
2. **Confirm currency.** Read the page's own published or last-updated date and version, and check
   for an announced supersession, transitional period, or pending amendment.
3. **Record proof.** `lastVerifiedAt` in UTC, plus either a SHA-256 checksum of the normalized text
   or — for a page whose markup churns meaninglessly — a dated review note quoting the exact
   provision relied on. A bare "verified" with no artifact is not a verification.
4. **Set `nextReviewDue`** from `reviewIntervalDays`.
5. **Update rule data and tests before publication.** A verified change is finished when
   `rights-rules-engineer` has landed both the value and its golden test, and the tests are green.
6. **Fail closed on doubt.** Unreachable, materially changed, or ambiguous means `unreachable` or
   `superseded`, publication held, and escalation to `build-orchestrator` (`AGENTS.md §7`).

## 4. Standing constraints carried in the records

- **EU.** The July 2026 reform is `adopted_not_effective`. Entry into force is Official Journal
  publication plus 12 months and 20 days; `effectiveFrom` stays `null` until a verified OJ citation
  exists. `eu-council-2026-07-13` is a press release and can never supply that date.
- **US.** The 2026-07-08 enforcement discretion through 2027-07-07 is guidance in the
  `us_enforcement_discretion` layer. It never edits `effectiveFrom` or `effectiveTo` on the
  statutory refund set and never suppresses a refund outcome.
- **Canada.** A consultation document, gazette proposal, or announced intention is not law.
- **Dashboard commitments.** Voluntary, per-airline, changeable without notice, separate module,
  never blended into a statutory outcome.
- Every date in the `DIRECTIVE.md §3.5` snapshot is dated 2026-07-17 and is an assertion to
  re-verify, not a fact to copy.

## 5. Out of scope for this cycle

No Cirium or OAG placeholder exists, because no Cirium or OAG adapter is enabled
(`docs/PROVIDER_LICENSING.md §3.2`, `§3.3`). Enabling either adds a `provider_docs` record for that
vendor's current official developer documentation first.
