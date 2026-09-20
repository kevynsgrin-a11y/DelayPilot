/**
 * Site-verification tokens. The case that matters is the one where a token is configured but
 * unusable: it must resolve to nothing AND say so, rather than reach an HTML attribute.
 */

import { describe, expect, it } from 'vitest'

import {
  bingSiteVerification,
  googleSiteVerification,
  normalizeVerificationToken,
  verificationProblems,
  verificationTokenProblem,
} from './verification.ts'

describe('normalizeVerificationToken', () => {
  it('accepts the shapes the two tools issue', () => {
    expect(normalizeVerificationToken('google-site-verification=abcDEF123_-')).toBe(
      'google-site-verification=abcDEF123_-',
    )
    expect(normalizeVerificationToken('  1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D  ')).toBe(
      '1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D',
    )
  })

  it('resolves an unset or empty variable to nothing', () => {
    expect(normalizeVerificationToken(undefined)).toBeUndefined()
    expect(normalizeVerificationToken('')).toBeUndefined()
    expect(normalizeVerificationToken('   ')).toBeUndefined()
  })

  it('refuses anything that could end the attribute it is written into', () => {
    expect(normalizeVerificationToken('abc"><script>alert(1)</script>')).toBeUndefined()
    expect(normalizeVerificationToken("token' onload='x")).toBeUndefined()
    expect(normalizeVerificationToken('token with spaces')).toBeUndefined()
    expect(normalizeVerificationToken('short')).toBeUndefined()
  })
})

describe('verificationTokenProblem', () => {
  it('says nothing about a variable nobody set', () => {
    expect(verificationTokenProblem('GOOGLE_SITE_VERIFICATION', undefined)).toBeUndefined()
    expect(verificationTokenProblem('GOOGLE_SITE_VERIFICATION', '')).toBeUndefined()
  })

  it('names the variable and the rule when a set value is unusable', () => {
    const problem = verificationTokenProblem('BING_SITE_VERIFICATION', 'nope"')
    expect(problem).toContain('BING_SITE_VERIFICATION')
    expect(problem).toContain('attribute')
  })
})

describe('the build-time values', () => {
  it('are absent in this build, because neither variable is configured', () => {
    expect(googleSiteVerification).toBeUndefined()
    expect(bingSiteVerification).toBeUndefined()
    expect(verificationProblems).toEqual([])
  })
})
