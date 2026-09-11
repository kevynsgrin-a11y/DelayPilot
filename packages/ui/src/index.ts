// @delaypilot/ui
//
// Design tokens and accessible UI primitives shared by the public site and the authenticated app.
//
// Owner: brand-design-director (docs/agents/ROSTER.md §3). Composed patterns — segment card, rights
// card, connection cockpit — land in src/patterns/ and belong to frontend-ui-engineer.
//
// Stylesheets are not imported here; a consumer loads apps/web/src/styles/tokens.css and then
// @delaypilot/ui/primitives.css, in that order.

export * from './tokens/index.ts'

export { AdSlot, type AdSlotProps } from './primitives/AdSlot.tsx'
export { Badge, type BadgeProps } from './primitives/Badge.tsx'
export { Button, type ButtonProps } from './primitives/Button.tsx'
export { Callout, type CalloutProps } from './primitives/Callout.tsx'
export { Card, type CardProps } from './primitives/Card.tsx'
export { Checkbox, type CheckboxProps } from './primitives/Checkbox.tsx'
export {
  Combobox,
  ComboboxListbox,
  ComboboxOption,
  type ComboboxListboxProps,
  type ComboboxOptionProps,
  type ComboboxProps,
} from './primitives/Combobox.tsx'
export { DataTable, type DataTableColumn, type DataTableProps } from './primitives/DataTable.tsx'
export { Dialog, type DialogProps } from './primitives/Dialog.tsx'
export { Disclosure, type DisclosureProps } from './primitives/Disclosure.tsx'
export { Drawer, type DrawerProps } from './primitives/Drawer.tsx'
export { Field, type FieldControlProps, type FieldProps } from './primitives/Field.tsx'
export { Grid, GridArea, type GridAreaProps, type GridProps } from './primitives/Grid.tsx'
export { Icon, iconNames, type IconName, type IconProps } from './primitives/Icon.tsx'
export { Input, type InputProps } from './primitives/Input.tsx'
export { Link, type LinkProps } from './primitives/Link.tsx'
export { ProgressBar, type ProgressBarProps } from './primitives/ProgressBar.tsx'
export { ProvenanceChip, type ProvenanceChipProps } from './primitives/ProvenanceChip.tsx'
export { Radio, type RadioProps } from './primitives/Radio.tsx'
export { Select, type SelectProps } from './primitives/Select.tsx'
export { Skeleton, type SkeletonProps } from './primitives/Skeleton.tsx'
export { Stack, type SpaceStep, type StackProps } from './primitives/Stack.tsx'
export { StatusPill, type StatusPillProps } from './primitives/StatusPill.tsx'
export { Switch, type SwitchProps } from './primitives/Switch.tsx'
export { Tabs, type TabDefinition, type TabsProps } from './primitives/Tabs.tsx'
export { Toast, type ToastProps } from './primitives/Toast.tsx'
export { Tooltip, type TooltipProps } from './primitives/Tooltip.tsx'
export { VisuallyHidden, type VisuallyHiddenProps } from './primitives/VisuallyHidden.tsx'
