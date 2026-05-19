# Profil PRD

## Scope

- This PRD covers the standalone `Profil` screen in the worker app.
- The screen is reachable from:
  - the bottom navigation bar `Profil` tab
  - the avatar tap target in the Accueil header
- The screen is intentionally minimal in V1.
- The V1 product rule is:
  - `Profil = compte + sortie`
- The screen must support:
  - confirming who is logged in
  - editing display name
  - viewing the current role
  - switching application language
  - signing out
  - referencing the installed app version

## Product Goal

- Give the worker a single quiet place to confirm their account identity, adjust language, and log out.
- Keep the screen operational-free.
- No mission data, no notifications, no campaign metrics on this page.

## Primary User Need

- As a worker, I want to confirm which account is currently logged in.
- As a worker, I want to know what role I have on this campaign.
- As a worker, I want to update my display name if it is wrong.
- As a worker, I want to switch the app language between `Français` and `English`.
- As a worker, I want to sign out at the end of my day.
- As a worker, I want to reference the app version when I report a problem.

## Navigation And Layout

- Bottom navigation bar remains visible.
- `Profil` tab is active on this screen.
- Sticky top header with:
  - title `Profil`
  - subtitle `Compte et préférences`
  - `syncBadge` and `homeAvatar` aligned right
- Below the header, the page is a vertically scrollable stack of grouped cards.

## Page Sections

- Sections appear in this order from top to bottom:
  - `Identité`
  - `Préférences`
  - `Compte`
  - `À propos`
- Each section is rendered inside a white card surface.
- Each section is preceded by a small section label using the existing home section title pattern.

## Identité Section

- The Identité section must show:
  - avatar with initials (e.g., `OE`)
  - `Nom` row
  - `Rôle` row
- `Nom` is editable in V1:
  - tap on the row enters inline edit mode
  - inline edit shows a text input with `Enregistrer` and `Annuler` actions
  - `Enregistrer` persists the new name
  - `Annuler` reverts and exits edit mode
- `Rôle` is read-only in V1:
  - example value: `Worker terrain`
  - the role is assigned by the backend and cannot be changed in V1

## Préférences Section

- The Préférences section must show:
  - `Langue` row
- `Langue` is editable in V1.
- `Langue` is a tappable row:
  - tap opens a bottom sheet picker
  - the picker lists supported languages
- Supported languages in V1:
  - `Français` (default)
  - `English`
- Selecting a language in the picker:
  - applies the selection immediately
  - closes the picker
  - persists the choice for future sessions

## Compte Section

- The Compte section must show:
  - `Déconnexion` action
- `Déconnexion` is rendered as a destructive button.
- Tapping `Déconnexion`:
  - opens a confirmation dialog
  - dialog title example: `Se déconnecter ?`
  - dialog body example: `Vous serez déconnecté. Continuer ?`
  - dialog primary action: `Se déconnecter`
  - dialog secondary action: `Annuler`
- Confirming logs the worker out and returns to the sign-in screen.

## À propos Section

- The À propos section must show:
  - `Version app`
- `Version app` is read-only in V1.
- Format example:
  - `1.0.0 (build 42)`
- The value comes from the build manifest and is not user-editable.

## Display Naming

- Each row in a section uses a label and a value:
  - left: human-readable label (`Nom`, `Rôle`, `Langue`, `Version app`)
  - right or below: current value
- The Nom value uses the existing card title typography.
- The Rôle value uses the existing card subtitle typography.
- The Langue value shows the currently active language label.
- The Déconnexion row has no value, only the destructive action.

## Tap Behavior

- Tappable elements in V1:
  - `Nom` row → inline edit
  - `Langue` row → language picker sheet
  - `Déconnexion` button → confirmation dialog
- Non-tappable elements in V1:
  - `Rôle`
  - `Version app`
  - avatar

## States

- Default state:
  - all values loaded
- Loading state:
  - skeletons for `Nom` and `Rôle`
- Edit state:
  - `Nom` row in inline edit with input + actions
- Sheet state:
  - language picker open
- Dialog state:
  - logout confirmation open
- Save in progress state:
  - new name being persisted, optimistic update with `syncBadge` reflecting sync activity

## Suggested Data Model

```ts
type WorkerLanguage = "fr" | "en";

type WorkerProfile = {
  workerId: string;
  displayName: string;
  role: string;
  initials: string;
  language: WorkerLanguage;
  appVersion: string;
  appBuild: string;
};
```

## Display Mapping

- `displayName` example:
  - `Oussama El Fallah`
- `role` example:
  - `Worker terrain`
- `initials` example:
  - `OE`
- `language` UI label mapping:
  - `fr` → `Français`
  - `en` → `English`
- `appVersion` + `appBuild` example:
  - `1.0.0 (build 42)`

## Reuse

- Sticky header primitives:
  - `.posteStickyTop`
  - `.homeHeaderRow`
  - `.posteFixeTitleBlock`
  - `.posteFixeTitle`
  - `.posteFixeSubtitle`
  - `.homeHeaderActions`
  - `.homeAvatar`
  - `.syncBadge`
- Section card surface:
  - `.homeProgressOverviewCard`
- Section label:
  - `.homeSectionTitle`
- Row text styles:
  - `.posteFixeCardTitle` for primary value
  - `.posteFixeCardSubtitle` for secondary value
- Tappable row chevron:
  - `.posteArrow`
- Material Symbols (via `.googleSymbol`):
  - `person`
  - `language`
  - `logout`
  - `info`

## V1 Recommendation

- Build the Profil page with:
  - identity section (avatar, editable `Nom`, read-only `Rôle`)
  - preferences section (`Langue` picker)
  - compte section (`Déconnexion` with confirm dialog)
  - à propos section (`Version app`)
  - sticky header reusing the Accueil/Travail primitives
  - bottom navigation bar with `Profil` active

## V2 Recommendation

- Add:
  - notification mute toggles
  - theme override (dark/light)
  - offline preferences
  - support contact link
  - password change
  - avatar upload

## Out Of Scope For This PRD

- Avatar upload
- Password change
- Notification preferences
- Theme switch
- Account deletion
- Multi-account support
- Profile editing for `Rôle`
