/**
 * The token contract.
 *
 * What other agents consume: the typed layers, the breakpoint set, the contrast pair registry and
 * the measurement functions. The stylesheet itself is generated into apps/web/src/styles/tokens.css
 * by `pnpm --filter @delaypilot/ui tokens:build`.
 */

export {
  assertHex,
  contrastRatio,
  formatRatio,
  relativeLuminance,
  toRgb,
  type Hex,
} from './contrast.ts'

export {
  primitiveColorNames,
  primitiveColors,
  primitiveHex,
  seedColorNames,
  type PrimitiveColor,
  type PrimitiveColorName,
} from './primitive.ts'

export {
  border,
  breakpoints,
  externallyConsumedScaleTokens,
  layout,
  motion,
  radius,
  reducedMotion,
  scaleGroups,
  scaleTokenNames,
  size,
  space,
  typeScale,
  typography,
  type BreakpointName,
  type ScaleToken,
} from './scale.ts'

export {
  contrastGateAliases,
  contrastGateNames,
  semanticColorNames,
  semanticColors,
  semanticRaw,
  type SemanticColor,
  type SemanticColorName,
  type ThemedRaw,
} from './semantic.ts'

export {
  componentColorNames,
  componentColors,
  type ComponentColor,
  type ComponentColorName,
} from './component.ts'

export {
  contrastPairs,
  measureAllPairs,
  resolveSemantic,
  themeNames,
  tightestPair,
  usageThresholds,
  type ContrastPair,
  type PairMeasurement,
  type ThemeName,
  type UsageClass,
} from './pairs.ts'

export {
  interimProvenanceKinds,
  interimSeverities,
  interimStatusTones,
  provenanceLabels,
  severityToStatusTone,
  type InterimProvenanceKind,
  type InterimSeverity,
  type InterimStatusTone,
} from './interim-contracts.ts'

export { renderTokensCss } from './css.ts'
export { renderContrastTable } from './contrast-table.ts'
