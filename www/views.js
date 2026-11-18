import { icon } from './icons.js';
import { exportRecipes, exportText, importRecipes, importPlan } from './backup.js';
import { CATS, DAYS, norm, load, save, loadPlan, savePlan, loadMeals, saveMeals, loadShop, saveShop, putPhoto, getPhoto, delPhoto } from './store.js';

const app = document.getElementById('app');
const nav = document.getElementById('tabs');

const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const lines = (s) => s.split('\n').map((l) => l.trim()).filter(Boolean);

// downscale + JPEG keeps photos small (~100KB) and fast to load
const shrink = (file, max = 1024) => new Promise((ok, no) => {
  const img = new Image();
  img.onload = () => {
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(img.src);
    c.toBlob(ok, 'image/jpeg', 0.8);
  };
  img.onerror = no;
  img.src = URL.createObjectURL(file);
});

// object URLs for stored photos, cached so re-rendering the list doesn't reload them
const urls = new Map();
const photoURL = async (id) => {
  if (!urls.has(id)) {
    const b = await getPhoto(id);
    if (!b) return '';
    urls.set(id, URL.createObjectURL(b));
  }
  return urls.get(id);
};
const forget = (id) => { URL.revokeObjectURL(urls.get(id)); urls.delete(id); };
const hydrate = () => app.querySelectorAll('img[data-p]').forEach(async (img) => {
  const u = await photoURL(img.dataset.p);
  if (u) img.src = u;
});

export const DINO = `<img src="dino.png" alt="Dino chef">`;

let cat = '';
let week = 0; // offset in weeks from the current one

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const short = (d) => d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
const monday = (off) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7) + off * 7);
};

// tab bar only shows on the two top-level screens
const tabs = (on) => {
  nav.hidden = !on;
  nav.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.go === on));
};
nav.querySelector('[data-go=list]').innerHTML = `${icon('book')}Recetas`;
nav.querySelector('[data-go=plan]').innerHTML = `${icon('calendar')}Semana`;
nav.onclick = (e) => {
  const b = e.target.closest('button');
  if (b) b.dataset.go === 'plan' ? plan() : list();
};

function rows(recipes, q, c = cat) {
  const n = norm(q.trim());
  const hits = recipes.filter((r) => (!c || r.category === c) && norm(`${r.title}\n${r.ingredients}`).includes(n));
  if (!hits.length) return `<p class="none">Sin resultados.</p>`;
  return `<ul class="recipes">${hits.map((r) => `<li><button class="card" data-id="${r.id}">
    ${r.photo ? `<img class="thumb" data-p="${esc(r.id)}" alt="">` : `<span class="dot" aria-hidden="true">${esc(r.title[0].toUpperCase())}</span>`}
    <span><b>${esc(r.title)}</b><small>${r.category ? esc(r.category) + ' · ' : ''}${lines(r.ingredients).length} ingredientes</small></span>
    </button></li>`).join('')}</ul>`;
}

function closeMenu(refocus) {
  const menu = app.querySelector('.menu'), more = app.querySelector('#more');
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  more.setAttribute('aria-expanded', 'false');
  if (refocus) more.focus();
}
document.addEventListener('click', (e) => { if (!e.target.closest('.more')) closeMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(true); });

export function list() {
  tabs('list');
  const recipes = load();
  const used = CATS.filter((c) => recipes.some((r) => r.category === c));
  if (!used.includes(cat)) cat = '';
  app.innerHTML = (recipes.length
    ? `<input type="search" id="q" placeholder="Buscar por nombre o ingrediente" aria-label="Buscar recetas">
       <div class="chips" id="chips"></div>
       <div id="results"></div>`
    : `<div class="empty">${DINO}<h2>Tu recetario está vacío</h2><p>Toca + para guardar tu primera receta.</p></div>`)
    + `<div class="more">
         <button class="fab alt" id="more" aria-label="Exportar o importar" aria-haspopup="menu" aria-expanded="false">${icon('swap', 26, 2.5)}</button>
         <div class="menu" role="menu" hidden>
           ${recipes.length ? `<button role="menuitem" id="export">${icon('export')}Exportar recetas</button>` : ''}
           <button role="menuitem" id="import">${icon('import')}Importar recetas</button>
         </div>
       </div>
       <button class="fab" aria-label="Nueva receta">${icon('plus', 30, 3)}</button>`;
  app.querySelector('.fab:not(.alt)').onclick = () => form();
  const more = app.querySelector('#more');
  more.onclick = () => {
    const menu = app.querySelector('.menu');
    menu.hidden = !menu.hidden;
    more.setAttribute('aria-expanded', !menu.hidden);
    if (!menu.hidden) menu.querySelector('button').focus();
  };
  app.querySelector('#import').onclick = () => { closeMenu(); importForm(); };
  const results = app.querySelector('#results');
  if (!results) return;
  const q = app.querySelector('#q');
  const chips = app.querySelector('#chips');
  app.querySelector('#export').onclick = async () => {
    closeMenu();
    try { await exportRecipes(); } catch (e) { if (!/cancel/i.test(e?.message)) alert('No se pudo exportar.'); }
  };
  const draw = () => {
    chips.innerHTML = used.length
      ? ['', ...used].map((c) => `<button class="chip" data-c="${c}" aria-pressed="${c === cat}">${c || 'Todas'}</button>`).join('')
      : '';
    results.innerHTML = rows(recipes, q.value);
    hydrate();
  };
  q.oninput = draw;
  chips.onclick = (e) => {
    const c = e.target.closest('.chip');
    if (c) { cat = c.dataset.c; draw(); }
  };
  results.onclick = (e) => {
    const c = e.target.closest('.card');
    if (c) view(c.dataset.id);
  };
  draw();
}

function view(id) {
  tabs(null);
  const r = load().find((x) => x.id === id);
  if (!r) return list();
  app.innerHTML = `<div class="view">${r.photo ? `<img class="hero" data-p="${esc(r.id)}" alt="">` : ''}<h2>${esc(r.title)}</h2>${r.category ? `<span class="tag">${esc(r.category)}</span>` : ''}
    <h3>Ingredientes</h3><ul>${lines(r.ingredients).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    <h3>Pasos</h3><ol>${lines(r.steps).map((l) => `<li>${esc(l)}</li>`).join('')}</ol>
    <div class="row"><button class="btn alt" id="back">Volver</button>
    <button class="btn" id="edit">Editar</button>
    <button class="btn danger" id="del">Borrar</button></div></div>`;
  hydrate();
  app.querySelector('#back').onclick = list;
  app.querySelector('#edit').onclick = () => form(r);
  app.querySelector('#del').onclick = () => {
    if (confirm('¿Borrar receta?')) {
      save(load().filter((x) => x.id !== id));
      forget(id);
      delPhoto(id).catch(() => {});
      list();
    }
  };
}

function form(r = { title: '', category: '', ingredients: '', steps: '' }) {
  tabs(null);
  const id = r.id || crypto.randomUUID();
  let blob = null; // newly picked photo
  let keep = !!r.photo; // keep the stored one
  app.innerHTML = `<form>
    <label>Título</label><input name="title" required value="${esc(r.title)}">
    <label>Categoría</label><select name="category"><option value="">Sin categoría</option>${CATS.map((c) => `<option${c === r.category ? ' selected' : ''}>${c}</option>`).join('')}</select>
    <label>Ingredientes (uno por línea)</label><textarea name="ingredients">${esc(r.ingredients)}</textarea>
    <label>Pasos (uno por línea)</label><textarea name="steps">${esc(r.steps)}</textarea>
    <label>Foto</label><img id="pv" class="hero" alt="" hidden>
    <input type="file" id="file" accept="image/*">
    <button type="button" class="chip" id="rmph" hidden>Quitar foto</button>
    <div class="row"><button type="button" class="btn alt" id="cancel">Cancelar</button>
    <button class="btn">Guardar</button></div></form>`;
  const pv = app.querySelector('#pv'), rm = app.querySelector('#rmph'), file = app.querySelector('#file');
  const showPhoto = async () => {
    pv.hidden = rm.hidden = !(blob || keep);
    if (blob) pv.src = URL.createObjectURL(blob);
    else if (keep) pv.src = await photoURL(id);
  };
  showPhoto();
  file.onchange = async () => {
    if (!file.files[0]) return;
    try { blob = await shrink(file.files[0]); } catch { alert('No se pudo leer la imagen.'); }
    showPhoto();
  };
  rm.onclick = () => { blob = null; keep = false; file.value = ''; showPhoto(); };
  app.querySelector('#cancel').onclick = list;
  app.querySelector('form').onsubmit = async (e) => {
    e.preventDefault();
    const d = { ...Object.fromEntries(new FormData(e.target)), photo: !!blob || keep };
    try {
      if (blob) { await putPhoto(id, blob); forget(id); }
      else if (!keep && r.photo) { await delPhoto(id); forget(id); }
      const all = load();
      if (r.id) Object.assign(all.find((x) => x.id === r.id), d);
      else all.push({ id, ...d });
      save(all);
    } catch { return alert('No se pudo guardar la receta.'); }
    list();
  };
}

export function plan() {
  tabs('plan');
  const m = monday(week), wk = iso(m), meals = loadMeals(), slots = loadPlan()[wk] || {};
  const byId = Object.fromEntries(load().map((r) => [r.id, r]));
  const day = (i) => new Date(m.getFullYear(), m.getMonth(), m.getDate() + i);
  app.innerHTML = `<div class="weeknav"><button class="btn alt" data-w="-1" aria-label="Semana anterior">${icon('left', 24)}</button>
    <b>${short(day(0))} – ${short(day(6))}</b>
    <button class="btn alt" data-w="1" aria-label="Semana siguiente">${icon('right', 24)}</button></div>
    <div class="tools"><button class="chip" id="cfg">${icon('meals')}Comidas</button><button class="chip" id="shop">${icon('cart')}Lista de compras</button><button class="chip" id="xplan" aria-label="Exportar semana">${icon('export')}Exportar</button><button class="chip" id="iplan" aria-label="Importar semana">${icon('import')}Importar</button></div>
    <div id="days">${DAYS.map((n, i) => `<section class="day"><h3>${n} <small>${short(day(i))}</small></h3>${meals.map((ml) => {
      const r = byId[slots[`${i}-${ml.id}`]];
      return `<button class="slot" data-s="${i}-${ml.id}"><span>${esc(ml.name)}${ml.time ? `<small>${esc(ml.time)}</small>` : ''}</span>${r ? `<b>${esc(r.title)}</b>` : `<em>${icon('plus', 16)}Agregar</em>`}</button>`;
    }).join('')}</section>`).join('')}</div>`;
  app.querySelector('.weeknav').onclick = (e) => {
    const b = e.target.closest('[data-w]');
    if (b) { week += +b.dataset.w; plan(); }
  };
  app.querySelector('#cfg').onclick = mealsForm;
  app.querySelector('#shop').onclick = shopping;
  app.querySelector('#iplan').onclick = () => importScreen(
    'Importar semana',
    `Pega el texto de un plan exportado. Se coloca en la semana que ves (${short(day(0))} – ${short(day(6))}) y reemplaza solo los espacios que traiga.`,
    (t) => { const r = importPlan(t, wk); return `Colocadas: ${r.set}. Omitidas: ${r.skipped} (receta o comida no encontrada).`; },
    'El texto no es un plan válido.',
    plan,
  );
  app.querySelector('#xplan').onclick = async (e) => {
    const rows = DAYS.map((n, i) => {
      const l = meals.filter((ml) => byId[slots[`${i}-${ml.id}`]])
        .map((ml) => `  ${ml.name}${ml.time ? ` (${ml.time})` : ''}: ${byId[slots[`${i}-${ml.id}`]].title}`);
      return l.length ? [`${n} ${short(day(i))}`, ...l].join('\n') : '';
    }).filter(Boolean);
    if (!rows.length) return alert('No hay recetas en el plan de esta semana.');
    e.target.disabled = true;
    try { await exportText([`Plan semanal ${short(day(0))} – ${short(day(6))}`, ...rows].join('\n\n'), `plan-${wk}.txt`); }
    catch (err) { if (!/cancel/i.test(err?.message)) alert('No se pudo exportar.'); }
    e.target.disabled = false;
  };
  app.querySelector('#days').onclick = (e) => {
    const b = e.target.closest('.slot');
    if (b) pick(wk, b.dataset.s);
  };
}

function pick(wk, s) {
  tabs(null);
  const i = s[0]; // day index is one digit; the meal id (may contain '-') follows
  const ml = loadMeals().find((x) => x.id === s.slice(2));
  const filled = loadPlan()[wk]?.[s];
  app.innerHTML = `<h2 class="ptitle">${DAYS[i]} · ${esc(ml ? ml.name : '')}</h2>
    <input type="search" id="q" placeholder="Buscar por nombre o ingrediente" aria-label="Buscar recetas">
    <div id="results"></div>
    <div class="row"><button class="btn alt" id="cancel">Cancelar</button>${filled ? '<button class="btn danger" id="clear">Quitar</button>' : ''}</div>`;
  const q = app.querySelector('#q');
  const results = app.querySelector('#results');
  const set = (id) => {
    const p = loadPlan();
    p[wk] = { ...p[wk] };
    if (id) p[wk][s] = id; else delete p[wk][s];
    savePlan(p);
    plan();
  };
  const draw = () => { results.innerHTML = rows(load(), q.value, ''); };
  q.oninput = draw;
  results.onclick = (e) => {
    const c = e.target.closest('.card');
    if (c) set(c.dataset.id);
  };
  app.querySelector('#cancel').onclick = plan;
  if (filled) app.querySelector('#clear').onclick = () => set(null);
  draw();
}

function mealsForm() {
  tabs(null);
  const ms = loadMeals().map((x) => ({ ...x }));
  const draw = () => {
    app.innerHTML = `<h2 class="ptitle">Comidas</h2>
      <p class="hint">Nombre y hora opcional. Este orden es el de la semana.</p>
      ${ms.map((x, i) => `<div class="mealrow" data-i="${i}">
        <input class="mn" value="${esc(x.name)}" placeholder="Nombre" aria-label="Nombre">
        <input class="mt" type="time" value="${esc(x.time)}" aria-label="Hora">
        <button type="button" class="ic" data-a="up" aria-label="Subir"${i ? '' : ' disabled'}>${icon('up', 22)}</button>
        <button type="button" class="ic" data-a="down" aria-label="Bajar"${i < ms.length - 1 ? '' : ' disabled'}>${icon('down', 22)}</button>
        <button type="button" class="ic" data-a="del" aria-label="Quitar"${ms.length > 1 ? '' : ' disabled'}>${icon('x', 22)}</button></div>`).join('')}
      <button class="chip" id="add">${icon('plus')}Agregar comida</button>
      <div class="row"><button class="btn alt" id="cancel">Cancelar</button><button class="btn" id="save">Guardar</button></div>`;
    app.querySelectorAll('.mealrow').forEach((row) => {
      const i = +row.dataset.i;
      row.querySelector('.mn').oninput = (e) => { ms[i].name = e.target.value; };
      row.querySelector('.mt').oninput = (e) => { ms[i].time = e.target.value; };
      row.onclick = (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        if (b.dataset.a === 'del') ms.splice(i, 1);
        else {
          const j = i + (b.dataset.a === 'up' ? -1 : 1);
          [ms[i], ms[j]] = [ms[j], ms[i]];
        }
        draw();
      };
    });
    app.querySelector('#add').onclick = () => {
      ms.push({ id: crypto.randomUUID(), name: '', time: '' });
      draw();
      app.querySelectorAll('.mn')[ms.length - 1].focus();
    };
    app.querySelector('#cancel').onclick = plan;
    app.querySelector('#save').onclick = () => {
      const out = ms.map((x) => ({ ...x, name: x.name.trim() })).filter((x) => x.name);
      if (!out.length) return;
      saveMeals(out);
      plan();
    };
  };
  draw();
}

function shopping() {
  tabs(null);
  const m = monday(week), wk = iso(m);
  const byId = Object.fromEntries(load().map((r) => [r.id, r]));
  const mealIds = new Set(loadMeals().map((x) => x.id));
  const items = new Map(); // normalized line -> { text, n }; same line in several recipes = ×n, quantities are not summed
  for (const [slot, id] of Object.entries(loadPlan()[wk] || {})) {
    if (!mealIds.has(slot.slice(2)) || !byId[id]) continue;
    for (const l of lines(byId[id].ingredients)) {
      const k = norm(l), it = items.get(k);
      if (it) it.n++; else items.set(k, { text: l, n: 1 });
    }
  }
  const done = new Set(loadShop()[wk]);
  app.innerHTML = `<h2 class="ptitle">Lista de compras</h2>
    <p class="hint">Semana del ${short(m)}</p>
    ${items.size ? `<ul class="shop">${[...items].map(([k, it]) => `<li><label><input type="checkbox" data-k="${esc(k)}"${done.has(k) ? ' checked' : ''}>
      <span>${esc(it.text)}${it.n > 1 ? ` <small>×${it.n}</small>` : ''}</span></label></li>`).join('')}</ul>`
      : '<p class="none">No hay recetas en el plan de esta semana.</p>'}
    <div class="row"><button class="btn alt" id="back">Volver</button></div>`;
  app.querySelector('#back').onclick = plan;
  const ul = app.querySelector('.shop');
  if (ul) ul.onchange = () => {
    const s = loadShop();
    s[wk] = [...ul.querySelectorAll('input:checked')].map((i) => i.dataset.k);
    saveShop(s);
  };
}

function importScreen(title, hint, run, invalid, back) {
  tabs(null);
  app.innerHTML = `<h2 class="ptitle">${title}</h2>
    <p class="hint">${hint}</p>
    <label>Texto</label><textarea id="txt"></textarea>
    <label>Archivo</label><input type="file" id="file" accept=".json,.txt,application/json,text/plain">
    <div class="row"><button class="btn alt" id="cancel">Cancelar</button><button class="btn" id="go">Importar</button></div>`;
  const txt = app.querySelector('#txt'), file = app.querySelector('#file');
  file.onchange = async () => { if (file.files[0]) txt.value = await file.files[0].text(); };
  app.querySelector('#cancel').onclick = back;
  app.querySelector('#go').onclick = () => {
    let msg;
    try { msg = run(txt.value); } catch { return alert(invalid); }
    alert(msg);
    back();
  };
}

const importForm = () => importScreen(
  'Importar recetas',
  'Pega el texto exportado o elige el archivo. Las recetas que ya tienes no se duplican.',
  (t) => { const r = importRecipes(t); return `Importadas: ${r.added}. Omitidas: ${r.skipped}.`; },
  'El texto no es una exportación válida de Recetaurio.',
  list,
);
