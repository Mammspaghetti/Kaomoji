# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A small Angular 21 virtual-pet app: a kaomoji mascot in a scene, with a left nav bar. UI text, comments, test descriptions and most identifiers (`Humeur`, `MascotteStatut`…) are in **French** — keep that convention. The `objects/` folder (`Bowl`, `SceneObject`) is in English by the owner's request.

## Commands

- `npm start` (`ng serve`) — dev server at http://localhost:4200
- `npm run build` (`ng build`) — production build into `dist/` (budgets: 500kB warn / 1MB error initial; **4kB warn / 8kB error per component stylesheet** — split big CSS into sub-components, e.g. `kaomoji-face/gestes/`)
- `npm test` (`ng test`) — Vitest via `@angular/build:unit-test`, jsdom
- Single spec / folder: `npx ng test --watch=false --include src/app/scene` (repeat `--include` for several; globs with braces don't work)
- Formatting: Prettier — 100 cols, single quotes, Angular parser for `.html`

No linter or e2e framework is configured.

## Architecture

Standalone components only. `App` → `<app-kaomoji>`, which is just a layout: `<app-nav-bar />` + `<app-scene />`.

**State lives in two root services; components stay presentational/thin:**
- `MascotteStatut` (`mascotte-statut.ts`) — vital status as signals (`faim`, `surpoids`, `cadeaux`, `niveauJalousie`) plus timed reactions (`isTriste`, `aUnCadeau`, `isReclame`, `isJaloux`, `isVole`, `message`, auto-reset by `setTimeout`). It **derives** the displayed `humeur` (priority order in `humeurCalculee`) unless `humeurImposee` is set. Every interaction method (`manger`, `voler`, `offrirCadeau`, …) releases the imposed humeur. It also computes the `bandeau` (message / growing "STOP!!!") shown above the character.
- `MascotteEtat` (`mascotte-etat.ts`) — exposes `humeur`, lets the user impose one (`choisir`, `aleatoire`, `liberer`), and owns the **user-imported faces** (`visagesPerso`, persisted in `localStorage` key `kaomoji.visages`, merged over the defaults into `visages`/`visage`).

**Faces:** `kaomoji-face/humeur.ts` holds the `Humeur` union and the `VISAGES`/`LIBELLES` tables (`Record<Humeur, …>` — adding an humeur forces a face and label). `KaomojiFace` renders the bubble; skins and effects (CSS classes `humeur-<x>` + `@switch` overlays) are keyed on the humeur, so they also play when an humeur is imposed from the nav bar. `KaomojiGestes` draws what leaves the bubble (thrown table, waving arms).

**Scene** (`scene/`): three stacked layers — `.fond` (gradient + falling leaves), `.objets`, `.personnage` (name, bandeau, face, status legend). The character layer is `pointer-events: none` so objects behind stay clickable.

**Objects** (`objects/`): `SceneObject` interface (`id`, `kind`, `emoji`, `label`, `x`, `y` in % of the scene). `Bowl` (signal-based capacity/level, `take`/`fill`/`empty`) implements it; `ObjectView` positions any object and delegates `Bowl` instances (checked with `instanceof`) to `BowlView`, which calls `MascotteStatut`. Defaults come from `createDefaultObjects()` (fresh instances per call — bowls are stateful).

Styling: Tailwind v4 via PostCSS, but components mostly use their own CSS with the brown/cream "cartoon" palette (`#55352c` borders, `#bd7558` offset shadows). `src/styles.css` has global `.btn-*` classes not currently used by the nav bar or bowl. Animations respect `prefers-reduced-motion`.

## Known inconsistency

`src/app/app.spec.ts` expects routes/components that don't exist: `/` rendering `app-accueil` with `.titre`, and `/mascotte` rendering `.mascotte-nom`, `app-kaomoji` and `app-gamelle`. These 2 tests fail; `app.routes.ts` is empty. Wire the intended routes rather than deleting the tests, unless told otherwise.
