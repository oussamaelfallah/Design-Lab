# Travail Estimation Detail PRD

## Scope

- This PRD covers the detail screen opened when a worker taps an `Estimation` job from the `Travail` list.
- The screen is focused on helping the worker understand the job context, capture progress, capture rules, and parcel information before or during image collection.
- This PRD does not cover the camera/capture flow itself.

## Product Goal

- Give the worker a clear, compact detail page for one estimation task.
- Make the estimation context visible immediately.
- Show capture progress and sync health before the worker continues.
- Keep the layout consistent with the existing worker app and `Post Fixe` detail patterns.

## Entry Point

- User starts on the `Travail` tab.
- User taps an estimation card.
- App opens the estimation detail screen for that selected job.
- Back action returns to the `Travail` list with the previous filter state preserved.

## Screen Structure

- Top app/status bar remains consistent with the worker app.
- Detail header includes:
  - back action
  - screen title
  - selected parcel name
- Main content is vertically scrollable.
- Content is organized into four sections:
  - `Infos`
  - `Progression`
  - `Paramètres`
  - `Parcelle`

## Infos Section

- Purpose: summarize the selected estimation job.
- Must show:
  - estimation display name
  - sector
  - due date
  - status
- Example content:
  - `Estimation 2026 #1`
  - `Secteur S4`
  - `Fin : 3 Mars`
  - `En retard`
- The status should use the same semantic urgency rules as the `Travail` list:
  - `En retard`: error color
  - `À faire aujourd'hui`: warning color
  - `Planifié`: neutral color
  - `Terminé`: success color

## Progression Section

- Purpose: show capture completion and sync health.
- Must show:
  - remaining captures
  - completed captures vs target captures
  - pending sync count
  - failed sync count
- Example content:
  - `4 restantes`
  - `6 / 10 captures`
  - `2 en attente de sync`
  - `1 échec de sync`
- The progress bar should use the brand color for completed progress.
- Sync states should be visually distinct from capture progress.
- Failed sync should be more prominent than pending sync.

## Paramètres Section

- Purpose: show the capture configuration for this estimation.
- Must show:
  - percentage of trees
  - orientation
  - multi-image mode
  - capture mode
- Example content:
  - `Pourcentage d'arbres`: `5%`
  - `Orientation`: `Est`
  - `Multi-images`: `Active`
  - `Mode`: `Portrait`
- This section is read-only for the worker in V1 unless product later confirms edit permissions.

## Parcelle Section

- Purpose: show agronomic and parcel context needed for the estimation.
- Must show:
  - fruit type
  - variety
  - rootstock
  - tree count
  - spacing
- Example content:
  - `Type de fruit`: `Orange`
  - `Variété`: `Navel`
  - `Porte-greffe`: `Carrizo`
  - `Nombre d'arbres`: `320`
  - `Espacement`: `6 m x 4 m`
- This section is read-only in V1.

## Visual Design Guidance

- Use the same visual language as `Post Fixe` detail screens.
- Prefer simple section cards with labels and values.
- Avoid introducing new colors outside existing design tokens.
- Use:
  - brand color for primary progress
  - semantic error for overdue and failed sync
  - semantic warning/info for pending sync
  - muted text for secondary metadata
- Keep card styling flat and consistent with existing worker app surfaces.

## Data Model

```ts
type EstimationDetail = {
  id: string;
  parcelName: string;
  estimationName: string;
  sectorName: string;
  dueDateLabel: string;
  status: "late" | "due_today" | "scheduled" | "done";
  capturedImages: number;
  targetImages: number;
  remainingImages: number;
  pendingSyncImages: number;
  failedSyncImages: number;
  settings: {
    treePercentage: string;
    orientation: string;
    multiImagesEnabled: boolean;
    mode: "Portrait" | "Paysage";
  };
  parcel: {
    fruitType: string;
    variety: string;
    rootstock: string;
    treeCount: number;
    spacing: string;
  };
};
```

## Example Data

```ts
const estimationDetail = {
  id: "est-10112-1",
  parcelName: "Parcelle 10112",
  estimationName: "Estimation 2026 #1",
  sectorName: "Secteur S4",
  dueDateLabel: "Fin : 3 Mars",
  status: "late",
  capturedImages: 6,
  targetImages: 10,
  remainingImages: 4,
  pendingSyncImages: 2,
  failedSyncImages: 1,
  settings: {
    treePercentage: "5%",
    orientation: "Est",
    multiImagesEnabled: true,
    mode: "Portrait",
  },
  parcel: {
    fruitType: "Orange",
    variety: "Navel",
    rootstock: "Carrizo",
    treeCount: 320,
    spacing: "6 m x 4 m",
  },
};
```

## Actions

- V1 primary action:
  - continue or start capture flow
- V1 secondary action:
  - back to `Travail`
- Optional future actions:
  - retry failed sync
  - view captured images
  - open parcel details

## States

- Data state:
  - estimation details are available
- Loading state:
  - skeleton header and section placeholders
- Error state:
  - estimation details cannot be loaded
- Empty capture state:
  - `0 / target captures`
- Completed state:
  - captured images meet or exceed target
  - detail remains accessible

## V1 Recommendation

- Build the estimation detail as a read-only information and progress screen.
- Keep it visually close to `Post Fixe` detail pages.
- Defer editing settings and capture flow details until the next PRD.
