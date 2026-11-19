# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A small Angular 21 app about a kaomoji mascot (a virtual-pet style page: left nav bar + a scene showing the kaomoji face in a bubble). UI text, comments and test descriptions are written in **French** — keep that convention.

## Commands

- `npm start` (`ng serve`) — dev server at http://localhost:4200
- `npm run build` (`ng build`) — production build into `dist/` (budgets: 500kB warn / 1MB error initial; **4kB warn / 8kB error per component stylesheet**)
- `npm test` (`ng test`) — unit tests with Vitest via `@angular/build:unit-test`, jsdom environment
- Single spec: `npx ng test --include src/app/kaomoji/kaomoji.spec.ts`
- Run once without watch: `npx ng test --watch=false`
- Formatting: Prettier (`npx prettier --write .`) — 100 cols, single quotes, Angular parser for `.html`

No linter or e2e framework is configured.

## Architecture

- Standalone components only (no NgModules). Bootstrap: `src/main.ts` → `App` (`src/app/app.ts`) with providers from `src/app/app.config.ts` (router + global error listeners).
- Component naming follows the Angular 21 style: class `Kaomoji` in `kaomoji/kaomoji.ts` (no `.component` suffix), with sibling `kaomoji.html`, `kaomoji.css`, `kaomoji.spec.ts`. Selector prefix is `app-`.
- `App` renders `<router-outlet />` plus `<app-kaomoji>` directly; `app.routes.ts` is currently empty, so all visible UI comes from the `Kaomoji` component.
- Styling: Tailwind v4 via PostCSS (`.postcssrc.json`, `@import 'tailwindcss'` in `src/styles.css`). `src/styles.css` also defines shared global button classes (`.btn`, `.btn-brand`, `.btn-neutral`, `.btn-destructive`, `.btn-success`, styled after Salesforce lightning-button) meant to be reused across components. Component-specific styles live in each component's `.css` file (watch the 8kB budget).
- TypeScript is strict, with Angular `strictTemplates` and `strictInputAccessModifiers` enabled.

## Known inconsistency

`src/app/app.spec.ts` expects routes and components that don't exist yet: `/` rendering `app-accueil` with a `.titre`, and `/mascotte` rendering `.mascotte-nom` (containing `xxxXX-GP-XXxxx`), `app-kaomoji` and `app-gamelle`. These tests fail against the current code. They describe the intended structure (Accueil screen, Mascotte page, Gamelle component) — when adding those features, wire them into `app.routes.ts` to match, rather than deleting the tests, unless told otherwise.
