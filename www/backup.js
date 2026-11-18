import { load } from './store.js';

// Recipes as JSON text, photos left out (they live in IndexedDB and are too big for a share intent).
export async function exportRecipes() {
  const recipes = load().map(({ photo, ...r }) => r);
  const json = JSON.stringify({ app: 'recetaurio', version: 1, exported: new Date().toISOString(), recipes }, null, 2);
  const share = window.Capacitor?.isNativePlatform?.() && window.Capacitor.Plugins?.Share;
  if (share) return share.share({ title: 'Recetaurio', text: json, dialogTitle: 'Exportar recetas' });
  // browser preview: plain download
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  a.download = `recetaurio-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
