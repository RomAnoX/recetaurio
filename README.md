# Recetaurio

Recipe organizer and weekly meal planner for Android, with a little dinosaur chef as mascot. The name mixes *receta* (recipe) and *dinosaurio* (dinosaur). The interface is in Spanish.

Built with plain HTML, CSS and JavaScript (native ES modules, no bundler), packaged as a native Android app with [Capacitor](https://capacitorjs.com).

## Features

**Recipes**
- Create, edit and delete recipes: title, category, ingredients, steps and an optional photo
- Search by name or ingredient (accent and case insensitive)
- Filter by category: Desayuno, Comida, Cena, Postre, Bebida, Botana

**Week plan**
- Assign recipes to each day and meal; meals are configurable (add, rename, reorder, optional time, e.g. Colación Matutina)
- Browse any week with the arrows; tap the eye on a filled slot to read the recipe
- Shopping list for the displayed week, built from the planned recipes, with check-off
- Export the week as text and import it back into any week

**Backup**
- Export recipes as JSON (share sheet on Android) and import them back by pasting the text or picking a file
- Both live in the transfer button at the bottom-left of the Recipes page

Works offline. Recipes, plan and meals are stored in the app's `localStorage`; photos are stored in IndexedDB. Clearing the app's data or uninstalling it erases everything, so export now and then. The recipe export does not include photos, meals or the plan.

## Project layout

- `www/` – the app
  - `index.html`, `style.css`, `app.js` (entry point)
  - `views.js` – screens (list, recipe, form, week plan, shopping list, meals, import)
  - `store.js` – `localStorage` and IndexedDB access
  - `backup.js` – export and import
  - `icons.js` – inline SVG icons
  - `dino.png` (mascot), `fredoka.woff2` (font)
- `android/` – Capacitor Android project (icons and splash screens included)
- `capacitor.config.json` – app id `com.recetaurio.app`
- `.github/workflows/android-apk.yml` – builds the APK in GitHub Actions

`CLAUDE.md` has the detailed architecture, data formats, conventions and backlog.

## Run in the browser

```sh
npm install
npm start
```

Open it through the dev server: ES modules do not load from `file://`.

## Get the APK

Every push to `master` builds a debug APK in GitHub Actions (or run it by hand from the Actions tab, or `gh workflow run "Android APK"`). Open the run, download the `recetaurio-debug-apk` artifact, unzip it and copy `app-debug.apk` to the phone. Android will ask you to allow installing from unknown sources.

The debug builds are signed with a fixed key committed in `android/app/recetaurio-debug.p12`, so a new APK installs over the previous one and keeps your data. It is only for sideloaded debug builds; a Play Store release needs its own key.

## Build locally

Requires JDK 21 and the Android SDK (platform 36), or [Android Studio](https://developer.android.com/studio).

```sh
npm install
npx cap sync android          # copy www/ into the Android project
npx cap open android          # then press Run in Android Studio
# or, from the command line:
cd android && ./gradlew assembleDebug
```

Run `npx cap sync android` again after every change in `www/`.
