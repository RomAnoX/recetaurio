import { CATS, load, save } from './store.js';

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

const str = (v) => (typeof v === 'string' ? v : '');

// Merge an export (see above) into the stored recipes; recipes whose id already exists are skipped.
// Throws on anything that isn't a Recetaurio export.
export function importRecipes(text) {
  const data = JSON.parse(text);
  if (data?.app !== 'recetaurio' || !Array.isArray(data.recipes)) throw new Error('invalid');
  const all = load();
  const have = new Set(all.map((r) => r.id));
  let added = 0;
  for (const r of data.recipes) {
    const title = str(r?.title).trim();
    if (!title) continue;
    // ids end up in HTML attributes, so only accept plain ones
    const id = typeof r.id === 'string' && /^[\w-]{1,64}$/.test(r.id) ? r.id : crypto.randomUUID();
    if (have.has(id)) continue;
    have.add(id);
    all.push({ id, title, category: CATS.includes(r.category) ? r.category : '', ingredients: str(r.ingredients), steps: str(r.steps), photo: false });
    added++;
  }
  save(all);
  return { added, skipped: data.recipes.length - added };
}
