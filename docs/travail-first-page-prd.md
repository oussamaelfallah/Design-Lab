# Travail First Page PRD

## Scope

- This PRD covers the first page of the `Travail` tab in the worker app.
- The page is the worker's main task queue for image collection jobs.
- The page must support two job types:
  - `Estimation`
  - `Calibre`
- The page must help the worker quickly:
  - understand what to do next
  - identify urgent jobs
  - track capture progress
  - switch between job categories

## Product Goal

- Give field workers a single clear entry point for all active and completed image collection jobs.
- Prioritize urgent and incomplete work while keeping completed jobs visible.
- Make the list easy to scan with simple naming, clear status chips, and progress-based cards.

## Primary User Need

- As a worker, I want to see all my assigned jobs in one place.
- As a worker, I want to switch between `Tous`, `Estimation`, and `Calibre`.
- As a worker, I want to know which jobs are urgent, how many captures are completed, and how many are left.
- As a worker, I want completed jobs to remain visible so I can confirm they were done.

## Navigation And Layout

- Bottom navigation bar remains visible.
- `Travail` tab is active on this screen.
- Screen title is `Travail`.
- Under the title, the page shows a segmented filter control with:
  - `Tous`
  - `Estimation`
  - `Calibre`
- The main body is a vertically scrollable list of jobs.

## List Organization

- `Tous` view shows all jobs grouped by type.
- Group order in `Tous`:
  - `Estimation`
  - `Calibre`
- `Estimation` view shows only estimation jobs.
- `Calibre` view shows only calibre jobs.
- Grouping in `Tous` is intentional even with tabs:
  - tabs provide filtering
  - grouping improves scanability inside the mixed view

## Section Header

- In grouped views, each section has:
  - section title
  - summary count on the right
- Recommended section titles:
  - `Estimation`
  - `Calibre`
- The section count should be explicit and not ambiguous.
- Preferred format:
  - `2/7 terminées`
- Acceptable fallback if completion is not needed:
  - `7 tâches`
- Avoid showing only `2/7` without a label.

## Job Card Content

- Each card represents one worker job.
- Each card must show:
  - parcel name
  - task type
  - year
  - yearly sequence number for the parcel
  - sector name
  - status
  - progress bar
  - completed capture count
  - target capture count
  - remaining capture count

## Display Naming

- The card title should be human-readable and optimized for quick scanning.
- Recommended card title:
  - `Parcelle 10112`
- Recommended secondary line:
  - `Estimation 2026 • #2 • Secteur S4`
- Equivalent example for calibre:
  - `Calibre 2026 • #1 • Secteur S2`

## Backend Naming

- Backend generates estimation names from:
  - parcel name
  - `EST`
  - current year's last two digits
  - per-parcel yearly sequence number
- Example format:
  - `Parcel_ESTYY_N`
- This backend-generated reference is valid for system identity and internal traceability.
- This reference should not be the primary title in the worker list UI.
- It may be used in:
  - backend identity
  - support/debugging
  - exports
  - search metadata
  - detail pages

## Card Visual Structure

- Title on the first line, left aligned.
- Status chip on the first row, right aligned.
- Secondary metadata line under the title.
- Progress bar below the text block.
- Progress summary row below the progress bar:
  - left side: completed vs target captures
  - right side: remaining captures
- Example:
  - Title: `Parcelle 10112`
  - Secondary line: `Estimation 2026 • #2 • Secteur S4`
  - Status: `En retard`
  - Progress: `6 / 10 captures`
  - Remaining: `4 restantes`

## Status Model

- Statuses should stay simple and action-oriented.
- Recommended job statuses:
  - `En retard`
  - `À faire aujourd'hui`
  - `Planifié`
  - `Terminé`

## Status Rules

- `Terminé`
  - shown when `capturedImages >= targetImages`
- `En retard`
  - shown when due date is before today and the job is not complete
- `À faire aujourd'hui`
  - shown when due date is today and the job is not complete
- `Planifié`
  - shown when due date is after today and the job is not complete

## Status UX Guidance

- The status chip communicates urgency.
- The progress row communicates execution progress.
- Status and progress should not duplicate each other.
- Example:
  - badge says `En retard`
  - progress says `6 / 10 captures`

## Progress Rules

- Progress is based on image capture completion.
- Formula:
  - `progress = capturedImages / targetImages`
- Progress bar fill reflects this ratio.
- Progress label format:
  - `X / Y captures`
- Remaining label format:
  - `N restantes`
- Remaining count should usually equal:
  - `targetImages - capturedImages`

## Completed Jobs

- Completed jobs must remain visible in the list.
- Completed jobs should not be hidden after reaching the target capture count.
- Completed jobs should remain searchable and filterable.
- Completed jobs should appear lower than actionable jobs in the smart sort.

## Smart Sorting

- The list should use smart sorting by default.
- Primary sort order:
  - `En retard`
  - `À faire aujourd'hui`
  - `Planifié`
  - `Terminé`
- Secondary sort:
  - nearest due date first
- Tertiary sort for active work:
  - lower completion progress first
- Completed jobs should stay at the bottom of their section by default.

## Filtering

- Primary top-level filters:
  - `Tous`
  - `Estimation`
  - `Calibre`
- Future advanced filters may be added if task volume grows.
- Candidate advanced filters:
  - `En retard`
  - `Aujourd'hui`
  - `À faire`
  - `Terminées`

## Search

- Search is recommended if workers may receive many jobs at once.
- Search should be designed into the product direction even if not implemented in the first prototype.
- Search should support:
  - parcel name
  - sector name
  - task type
  - internal reference if needed

## Suggested Data Model

```ts
type TravailJobType = "estimation" | "calibre";

type TravailJobStatus =
  | "late"
  | "due_today"
  | "scheduled"
  | "done";

type TravailJob = {
  id: string;
  type: TravailJobType;
  parcelName: string;
  sectorName: string;
  year: number;
  yearlySequence: number;
  displayTitle: string;
  displayMeta: string;
  referenceName: string;
  capturedImages: number;
  targetImages: number;
  remainingImages: number;
  dueDate: string;
  status: TravailJobStatus;
};
```

## Display Mapping

- `displayTitle` example:
  - `Parcelle 10112`
- `displayMeta` example:
  - `Estimation 2026 • #2 • Secteur S4`
- `referenceName` example:
  - `Parcelle10112_EST26_2`

## States

- Data state
  - default working list with grouped jobs and progress
- Empty state
  - no jobs assigned
- Loading state
  - list skeletons
- Search empty state
  - no matching jobs for current query/filter combination

## Tap Behavior

- Tapping a job card should open the job detail flow in a later phase.
- For the first page PRD, the list page is the primary scope.
- Card rows should still be designed as clearly tappable interactive items.

## V1 Recommendation

- Build the first usable `Travail` page with:
  - seeded estimation and calibre jobs
  - top segmented filters
  - grouped `Tous` view
  - human-readable naming
  - simple urgency statuses
  - progress bars and capture counts
  - completed jobs kept visible
  - smart sorting

## V2 Recommendation

- Add:
  - search
  - advanced filters
  - detail navigation
  - optional sync states if they become real product states

## Out Of Scope For This PRD

- Detailed job execution screen
- Capture flow inside a job
- Upload/sync edge states unless later confirmed as a product need
- Supervisor-only views
