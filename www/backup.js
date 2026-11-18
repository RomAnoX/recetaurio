import { CATS, DAYS, norm, load, save, loadMeals, loadPlan, savePlan } from './store.js';

// Native: share sheet (text only, no file plugin). Browser preview: plain download.
async function send(text, name, type, title) {
  const share = window.Capacitor?.isNativePlatform?.() && window.Capacitor.Plugins?.Share;
  if (share) return share.share({ title, text, dialogTitle: title });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const today = () => new Date().toISOString().slice(0, 10);

// Recipes as JSON text, photos left out (they live in IndexedDB and are too big for a share intent).
export function exportRecipes() {
  const recipes = load().map(({ photo, ...r }) => r);
  const json = JSON.stringify({ app: 'recetaurio', version: 1, exported: new Date().toISOString(), recipes }, null, 2);
  return send(json, `recetaurio-${today()}.json`, 'application/json', 'Exportar recetas');
}

// Human-readable text (e.g. a week plan), not meant to be imported back.
export const exportText = (text, name) => send(text, name, 'text/plain', 'Plan semanal');

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

// Parse the text made by the week export ("Lunes 16 nov" / "  Desayuno (08:00): Sopa") into the
// week `wk` (monday yyyy-mm-dd). Recipes and meals are matched by name; slots it can't match are
// skipped. Merges into the week: only the slots in the text change. Throws if nothing was recognised.
export function importPlan(text, wk) {
  const recipes = new Map();
  for (const r of load()) if (!recipes.has(norm(r.title))) recipes.set(norm(r.title), r.id);
  const meals = new Map(loadMeals().map((m) => [norm(m.name), m.id]));
  const slots = {};
  let day = -1, skipped = 0;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const m = line.match(/^(.*?)(?: \(\d{1,2}:\d{2}\))?: (.+)$/);
    if (!m) {
      const d = DAYS.findIndex((n) => norm(line).startsWith(norm(n)));
      if (d >= 0) day = d;
      continue;
    }
    if (day < 0) continue;
    const meal = meals.get(norm(m[1])), recipe = recipes.get(norm(m[2].trim()));
    if (meal && recipe) slots[`${day}-${meal}`] = recipe; else skipped++;
  }
  const set = Object.keys(slots).length;
  if (!set && !skipped) throw new Error('invalid');
  if (set) {
    const p = loadPlan();
    p[wk] = { ...p[wk], ...slots };
    savePlan(p);
  }
  return { set, skipped };
}
