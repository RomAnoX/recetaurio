const KEY = 'recetaurio.recipes';

export const CATS = ['Desayuno', 'Comida', 'Cena', 'Postre', 'Bebida', 'Botana'];

export const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};
export const save = (list) => localStorage.setItem(KEY, JSON.stringify(list));

const PLAN = 'recetaurio.plan';

const MEALS = 'recetaurio.meals';

// default ids equal the names so plans saved before meals were configurable still match
const DEFAULT_MEALS = ['Desayuno', 'Comida', 'Cena'].map((n) => ({ id: n, name: n, time: '' }));

// [{ id, name, time: 'HH:MM' | '' }], in display order
export const loadMeals = () => {
  try {
    const m = JSON.parse(localStorage.getItem(MEALS));
    return Array.isArray(m) && m.length ? m : DEFAULT_MEALS;
  } catch { return DEFAULT_MEALS; }
};
export const saveMeals = (m) => localStorage.setItem(MEALS, JSON.stringify(m));

// { "<monday yyyy-mm-dd>": { "<day 0-6>-<meal id>": recipeId } }
export const loadPlan = () => {
  try { return JSON.parse(localStorage.getItem(PLAN)) || {}; } catch { return {}; }
};
export const savePlan = (p) => localStorage.setItem(PLAN, JSON.stringify(p));

const SHOP = 'recetaurio.shop';

// { "<monday yyyy-mm-dd>": [normalized ingredient, ...] } = items ticked off
export const loadShop = () => {
  try { return JSON.parse(localStorage.getItem(SHOP)) || {}; } catch { return {}; }
};
export const saveShop = (s) => localStorage.setItem(SHOP, JSON.stringify(s));

// Photos live in IndexedDB as Blobs keyed by recipe id; the recipe only keeps `photo: true`.
const db = new Promise((ok, no) => {
  const q = indexedDB.open('recetaurio', 1);
  q.onupgradeneeded = () => q.result.createObjectStore('photos');
  q.onsuccess = () => ok(q.result);
  q.onerror = () => no(q.error);
});
const tx = async (mode, fn) => {
  const d = await db;
  return new Promise((ok, no) => {
    const t = d.transaction('photos', mode);
    const req = fn(t.objectStore('photos'));
    t.oncomplete = () => ok(req.result);
    t.onerror = t.onabort = () => no(t.error);
  });
};
export const putPhoto = (id, blob) => tx('readwrite', (s) => s.put(blob, id));
export const getPhoto = (id) => tx('readonly', (s) => s.get(id));
export const delPhoto = (id) => tx('readwrite', (s) => s.delete(id));

// one-time move of photos saved as data URLs inside the recipe (old format) into IndexedDB
export async function migratePhotos() {
  const all = load();
  let dirty = false;
  for (const r of all) {
    if (typeof r.photo !== 'string' || !r.photo) continue;
    try {
      await putPhoto(r.id, await (await fetch(r.photo)).blob());
      r.photo = true;
      dirty = true;
    } catch { /* leave it, retried next launch */ }
  }
  if (dirty) save(all);
}
