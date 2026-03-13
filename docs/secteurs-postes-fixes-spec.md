# DS-01 Spec — Secteurs / Postes Fixes

## Scope

- App shell bottom tab bar includes `Post Fixe` tab.
- `Secteurs` is the default view of `Post Fixe` page.
- List is scrollable and contains Poste Fixe cards with progress.

## Navigation Prototype

- Tab bar visible on all main screens.
- `Post Fixe` tab is active on Secteurs screen.
- Tapping a Poste Fixe card opens a detail prototype view.
- Detail view has a back action to return to the list.

## Poste Fixe Card

- Container:
  - Background: `#FFFFFF`
  - Radius: `14px`
  - Padding: `12px`
- Title:
  - Format: `Poste Fixe ####`
  - Font size: `14px`
  - Weight: `500`
  - Color: `#1A2623`
- Sector line:
  - Format: `Secteur S#`
  - Font size: `12px`
  - Weight: `400`
  - Color: `#667774`
- Dates line:
  - Format: `Début : DD MMM` and `MAJ : DD MMM`
  - Font size: `11px`
  - Weight: `400`
  - Color: `#808A90`
- Chevron icon:
  - Google Symbols `chevron_right`
  - Size: `18px`
  - Color: `#6F807B`

## Progress Bar Component Spec

- Track:
  - Height: `8px`
  - Radius: `999px`
  - Color: `#E2E8E6`
- Fill:
  - Height: `8px`
  - Radius: `999px`
  - Color: `#01A362`
- Percentage label:
  - Font size: `12px`
  - Weight: `500`
  - Color: `#3C4C48`

## Progress States

- `0%`
- `20%`
- `40%`
- `60%`
- `80%`
- `100%`

## List States

- Data state:
  - Scrollable list of cards.
  - Includes current campaign cards and metadata.
- Loading state:
  - Skeleton card placeholders.
  - 5 card skeletons with title/subtitle/progress placeholders.
- Empty state:
  - Icon + title + helper text.
  - Message indicates no Poste Fixe data for campaign.

## Layout & Spacing

- Screen content margin rule: `16px`.
- Section gap: `12px`.
- Card-to-card gap: `10px`.
- Top control chips gap: `8px`.

## Colors

- Surface: `#F3F5F7`
- Card: `#FFFFFF`
- Primary/Progress: `#01A362`
- Text primary: `#1A2623`
- Text secondary: `#61716D`
- Muted/icon: `#6F807B`

## Tap Behaviors

- State chips (`Liste`, `Loading`, `Empty`) toggle list state.
- Poste Fixe card tap opens detail prototype for the selected card.
- Back action in detail returns to list.
- Bottom tab remains visible and active on `Post Fixe`.
