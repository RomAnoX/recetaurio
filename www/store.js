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
