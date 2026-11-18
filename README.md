# Recetaurio

Recipe organizer for Android with a little dinosaur chef as mascot. The name mixes *receta* (recipe) and *dinosaurio* (dinosaur).

Built with plain HTML, CSS and JavaScript, packaged as a native Android app with [Capacitor](https://capacitorjs.com).

## Features

- Create, edit and delete recipes (title, category, ingredients, steps)
- Search by name or ingredient (accent and case insensitive)
- Filter by category: Desayuno, Comida, Cena, Postre, Bebida, Botana
- Works offline; recipes are stored on the device (`localStorage`)

## Project layout

- `www/` – the app (`index.html`, `app.js`, `style.css`, mascot `dino.png`, font)
- `android/` – Capacitor Android project (icons and splash screen included)
- `capacitor.config.json` – app id `com.recetaurio.app`

## Run in the browser

```sh
npm install
npm start
```

## Build for Android

Requires [Android Studio](https://developer.android.com/studio) (JDK and Android SDK).

```sh
npm install
npx cap sync android   # copy www/ into the Android project
npx cap open android   # then press Run in Android Studio
```

Run `npx cap sync android` again after every change in `www/`.

## Ideas

Photos, favorites, backup/export, sync across devices.
