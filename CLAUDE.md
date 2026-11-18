# Recetaurio

Offline recipe organizer for Android. Mascot: a dinosaur chef. Name = *receta* + *dinosaurio*. UI language is Spanish (`<html lang="es">`); keep all user-facing strings in Spanish.

## Product goal

Store many recipes, then build a **weekly meal plan** from them. Recipes are the means; the plan is the end. Prioritize plan features over other backlog items.

## Stack

- Plain HTML/CSS/JS, no framework, no bundler, no build step. App lives in `www/`.
- Capacitor 8 wraps `www/` as a native Android app (`appId` `com.recetaurio.app`, `webDir` `www`).
- Android: `minSdk 24`, `targetSdk 36`. `android/` is the stock Capacitor project plus custom icons and splash screens.
- Storage: `localStorage` key `recetaurio.recipes` (JSON array). No backend, no network.

## Commands

```sh
npm install
npm start                # npx serve www, browser preview
npx cap sync android     # REQUIRED after every change in www/
npx cap open android     # opens Android Studio, press Run
```

No tests, linter or formatter configured. Verify UI changes in the browser (`npm start`) and, for native behavior, on an emulator/device.

## Layout

| Path | Purpose |
|------|---------|
| `www/index.html` | Shell: `<header>` (title + `#mascot`) and `<main id="app">` |
| `www/app.js` | Entry point: calls `list()`, fills `#mascot` |
| `www/store.js` | `CATS`, `DAYS`, `norm`, localStorage `load`/`save` (recipes), `loadPlan`/`savePlan`, `loadMeals`/`saveMeals`, `loadShop`/`saveShop`; IndexedDB `putPhoto`/`getPhoto`/`delPhoto`, `migratePhotos` |
| `www/icons.js` | `icon(name, size, stroke)` inline SVG set (24px grid, round caps, `currentColor`) |
| `www/backup.js` | `send()` (share sheet / download), `exportRecipes()`, `exportText()`, `importRecipes()`, `importPlan()` |
| `www/views.js` | Helpers (`esc`, `lines`, `norm`), `DINO`, screens `list`/`view`/`form`/`importScreen` (generic paste/file import used by recipes and plan)/`plan`/`pick`/`mealsForm`/`shopping`, tab bar |
| `www/style.css` | All styling (~107 lines) |
| `www/dino.png` | Mascot, used in header and empty state |
| `www/fredoka.woff2` | Self-hosted display font (variable, weight 300-700) |
| `android/` | Capacitor Android project; `MainActivity.java` is the stock one |
| `capacitor.config.json` | App id, name, webDir |

## Architecture (`www/*.js`)

Native ES modules (`<script type="module">`), no bundler. Needs http(s): `file://` blocks module imports (`npm start` and Capacitor both serve over http). Re-renders `#app` via `innerHTML` on every screen change; handlers attached with `onclick`/`oninput` after each render.

- Data model: `{ id: crypto.randomUUID(), title, category, ingredients, steps, photo }`. `ingredients` and `steps` are newline-separated strings, split with `lines()`. `category` is `''` or one of `CATS`.
- Persistence: `load()` (tolerates corrupt JSON, returns `[]`) and `save(list)`. Every mutation does load → modify → save → `list()`.
- Screens (plain functions, no router):
  - `list()` — search input, category chips, results, FAB `+`. Shows empty state with big dino when no recipes.
  - `view(id)` — read-only recipe with Volver / Editar / Borrar (`confirm()` before delete).
  - `form(r)` — create/edit. Edit when `r.id` is set.
- `rows(recipes, q)` — filter by module-level `cat` AND accent/case-insensitive substring match of `title + ingredients`.
- `norm()` — NFD-strip diacritics + lowercase. Use it for any new text matching.
- `esc()` — HTML-escape. Every user string interpolated into a template MUST go through it (XSS via innerHTML otherwise).
- `CATS` = Desayuno, Comida, Cena, Postre, Bebida, Botana. Chips show only categories that have recipes; `cat` resets to `''` (Todas) if its category no longer has any.
- `cat` (selected chip) is module state, survives navigation between screens but not app restart. Search text is not preserved when leaving the list.

## Design system (`www/style.css`)

- Palette tokens in `:root`: `--swamp #1f3a2d` (header, primary buttons), `--fern #5fae4e` (accents, recipe dot), `--yolk #ffc933` (header border, FAB, tag), `--shell #f2f6ec` (background), `--tomato #d9442e` (danger), `--ink`, `--muted`.
- Fonts: Fredoka (`--display`) for headings, buttons, chips, FAB; system-ui for body.
- Mascot overlaps the header bottom edge (`margin-bottom: -18px`); hidden on the empty state (which shows its own large dino).
- Mobile-first, `main` max-width 560px. Respects `env(safe-area-inset-*)`. Touch targets ≥ 40-48px.
- Accessibility already in place: `aria-label` on search and FAB, `aria-pressed` on chips, `:focus-visible` outlines, `prefers-reduced-motion`.

## Conventions

- Icons: never emoji or text glyphs (⬇ ▲ 🛒 render differently per Android version). Add a path to `icons.js` and use `icon('name')`; decorative, so keep a text label or `aria-label` on the button. Stroke ~2.25 to match Fredoka. Active tab icon turns `--yolk`.
- Keep it minimal: no new dependencies, frameworks or abstractions unless a feature truly needs them.
- Match existing style: terse arrow functions, template literals, 2-space indent, CSS tokens instead of hard-coded colors.
- Spanish strings; accents required (`Categoría`, `Título`).
- Mascot and icons derive from one source image; Android launcher icons and 11 splash screens (`drawable*/splash.png`, all densities) are generated assets. Regenerate all densities together if the art changes.

## Known gaps and quirks

- `@fontsource-variable/fredoka` is in `package.json` but unused; the font is the local `www/fredoka.woff2`. Safe to remove.
- No Android back-button handling: back exits the app instead of returning from `view`/`form` to the list (would need `@capacitor/app` `backButton` listener).
- `load()` does not validate shape; a valid-JSON-but-wrong-shape value (e.g. object, or recipe missing `title`) would break `rows()` (`r.title[0]`).
- `form` submit on edit does `Object.assign(all.find(...), d)`; throws if the recipe vanished meanwhile (not reachable today, single screen at a time).
- No `package.json` `sync` coupling: forgetting `npx cap sync android` means the APK ships stale `www/`.
- `localStorage`/IndexedDB are wiped by clearing app data or uninstalling; export (recipes text only) is the only backup.
- GitHub reports ~115 Dependabot vulnerabilities from old transitive deps; expected to clear on rescan, recheck after `npm install`.
- Template helper `DINO` is injected in two places; `#mascot` is filled once at load.

## Photos

- Optional photo per recipe. Blob (JPEG) in **IndexedDB** (db `recetaurio`, store `photos`, key = recipe id); the recipe only keeps `photo: true`. No Capacitor Filesystem, by decision.
- Picked with `<input type="file" accept="image/*">` (Android WebView offers camera/gallery, no permission), downscaled by `shrink()` in `views.js` to max 1024px, quality 0.8.
- Display: templates emit `<img data-p="<recipe id>">`; `hydrate()` fills `src` from `photoURL()` (object URLs cached in a Map, revoked via `forget()` when a photo changes). Round thumbnail in the list (replaces the initial dot), hero image in `view()`, preview in `form()`.
- Old format (data URL string in `recipe.photo`) is moved to IndexedDB once at startup by `migratePhotos()` in `app.js` (top-level await).
- Clearing app data wipes IndexedDB too; export does not include photos yet.

## Export

- `backup.js` `exportRecipes()`: JSON `{ app, version: 1, exported, recipes }` (recipes without photos, plan and meals not included).
- Native: `Capacitor.Plugins.Share.share({ text: json })` (`@capacitor/share`; no bundler, so plugins are reached through `window.Capacitor.Plugins`). Browser preview: downloads a `.json`.
- Text-only share because a share intent can't carry photos/large payloads without a file, and the Filesystem plugin was rejected. Untested on a real device.
- Week plan export: ⬇ Exportar semana on the week screen builds readable text for the displayed week (only filled slots; days with nothing are omitted; time shown in parentheses) and sends it with `exportText()`. Plain text for sharing (chat, notes); alerts if the week is empty.
- Week plan import: ⬆ Importar semana on the week screen → `importPlan(text, wk)` parses that same text into the **displayed** week (`wk`). Day header lines (`Lunes 16 nov`, matched by day name, date ignored) set the day; `Meal (HH:MM): Recipe` lines are matched by `norm`'d meal name and recipe title against what is on the device. Unmatched slots are skipped and counted, never created (no auto-creating recipes/meals). Merges: only slots present in the text change. Throws if nothing recognisable. Works with hand-written text too. Photos/recipes are not carried, so import recipes first on a new device.
- `importRecipes(text)` (same file) merges an export: needs `app === 'recetaurio'` and a `recipes` array, else throws. Recipes whose `id` already exists are skipped (no overwrite); fields are coerced to strings, unknown category becomes `''`, ids that aren't `[\w-]{1,64}` get a fresh UUID (ids go into HTML attributes, don't loosen this). Imported recipes have no photo.
- UI: `importForm()` (Importar recetas in the list screen's transfer menu, also in the empty state): paste text or pick a file (loaded into the textarea). Text paste is the main path since Android export is share-as-text.

## List screen floating buttons

- Two fixed round buttons (so they stay reachable with 100+ recipes): yellow `+` bottom-right (new recipe, selected as `.fab:not(.alt)`, do not use bare `.fab`), swamp transfer button bottom-left (`#more`, `.more` wrapper) that opens `.menu` with Exportar recetas (only if recipes exist) and Importar recetas.
- Menu: `role="menu"`, `aria-expanded`, focus moves to first item on open; closes on outside click, Escape (refocuses `#more`), or choosing an item. The two document-level listeners live in `views.js` next to `closeMenu()`.

## Weekly plan

- Storage key `recetaurio.plan`: `{ "<monday yyyy-mm-dd>": { "<day 0-6>-<meal id>": recipeId } }`. Week starts Monday; `week` (module var in `views.js`) is the offset from the current week.
- Slots: Lunes-Domingo × configurable meals. One recipe per slot.
- Meals: key `recetaurio.meals`, `[{ id, name, time: 'HH:MM' | '' }]` in display order. Defaults Desayuno/Comida/Cena with `id === name`, so plan keys saved before meals were configurable still match. New meals get `crypto.randomUUID()` ids (contain `-`; parse slot key as `s[0]` day + `s.slice(2)` id). Edited via `mealsForm()` (⚙ button on the week screen): rename, optional time, reorder ▲▼, delete (min 1), add. Deleting a meal hides its plan entries (left in storage, not restored by re-adding the same name).
- `plan()` shows the week with prev/next; tapping a slot opens `pick()` (search, tap recipe to assign, Quitar to clear). Deleted recipes render as empty slots; stale ids stay in storage, harmless.
- Tab bar `#tabs` (Recetas / Semana) shows only on `list` and `plan`; `view`, `form`, `pick` hide it via `tabs(null)`. Every screen function must call `tabs(...)` first.

## Shopping list

- `shopping()` (🛒 button on the week screen) builds the list for the displayed week from the ingredients of every planned recipe, skipping slots of deleted meals/recipes.
- Dedupe by `norm(line)`; the same line in N places shows `×N`. Quantities are NOT parsed or summed ("2 huevos" + "3 huevos" stay separate lines) because ingredients are free text.
- Ticked items: key `recetaurio.shop`, `{ "<monday>": [norm line, ...] }`. Not pruned.

## Backlog

- Structured ingredients (qty + unit + name) so the shopping list can sum quantities
- Favorites
- Include photos, meals and plan in export/import
- Sync across devices

## History

- `856960d` Initial code
- `5d02ba6` Start over: Capacitor Android app with recipes, search and categories
