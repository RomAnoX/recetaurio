import { CATS, load, save, loadPlan, savePlan, loadMeals, saveMeals } from './store.js';

const app = document.getElementById('app');
const nav = document.getElementById('tabs');

const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const lines = (s) => s.split('\n').map((l) => l.trim()).filter(Boolean);
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const DINO = `<img src="dino.png" alt="Dino chef">`;

let cat = '';
let week = 0; // offset in weeks from the current one

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
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
nav.onclick = (e) => {
  const b = e.target.closest('button');
  if (b) b.dataset.go === 'plan' ? plan() : list();
};

function rows(recipes, q, c = cat) {
  const n = norm(q.trim());
  const hits = recipes.filter((r) => (!c || r.category === c) && norm(`${r.title}\n${r.ingredients}`).includes(n));
  if (!hits.length) return `<p class="none">Sin resultados.</p>`;
  return `<ul class="recipes">${hits.map((r) => `<li><button class="card" data-id="${r.id}">
    <span class="dot" aria-hidden="true">${esc(r.title[0].toUpperCase())}</span>
    <span><b>${esc(r.title)}</b><small>${r.category ? esc(r.category) + ' · ' : ''}${lines(r.ingredients).length} ingredientes</small></span>
    </button></li>`).join('')}</ul>`;
}

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
    + `<button class="fab" aria-label="Nueva receta">+</button>`;
  app.querySelector('.fab').onclick = () => form();
  const results = app.querySelector('#results');
  if (!results) return;
  const q = app.querySelector('#q');
  const chips = app.querySelector('#chips');
  const draw = () => {
    chips.innerHTML = used.length
      ? ['', ...used].map((c) => `<button class="chip" data-c="${c}" aria-pressed="${c === cat}">${c || 'Todas'}</button>`).join('')
      : '';
    results.innerHTML = rows(recipes, q.value);
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
  app.innerHTML = `<div class="view"><h2>${esc(r.title)}</h2>${r.category ? `<span class="tag">${esc(r.category)}</span>` : ''}
    <h3>Ingredientes</h3><ul>${lines(r.ingredients).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    <h3>Pasos</h3><ol>${lines(r.steps).map((l) => `<li>${esc(l)}</li>`).join('')}</ol>
    <div class="row"><button class="btn alt" id="back">Volver</button>
    <button class="btn" id="edit">Editar</button>
    <button class="btn danger" id="del">Borrar</button></div></div>`;
  app.querySelector('#back').onclick = list;
  app.querySelector('#edit').onclick = () => form(r);
  app.querySelector('#del').onclick = () => {
    if (confirm('¿Borrar receta?')) { save(load().filter((x) => x.id !== id)); list(); }
  };
}

function form(r = { title: '', category: '', ingredients: '', steps: '' }) {
  tabs(null);
  app.innerHTML = `<form>
    <label>Título</label><input name="title" required value="${esc(r.title)}">
    <label>Categoría</label><select name="category"><option value="">Sin categoría</option>${CATS.map((c) => `<option${c === r.category ? ' selected' : ''}>${c}</option>`).join('')}</select>
    <label>Ingredientes (uno por línea)</label><textarea name="ingredients">${esc(r.ingredients)}</textarea>
    <label>Pasos (uno por línea)</label><textarea name="steps">${esc(r.steps)}</textarea>
    <div class="row"><button type="button" class="btn alt" id="cancel">Cancelar</button>
    <button class="btn">Guardar</button></div></form>`;
  app.querySelector('#cancel').onclick = list;
  app.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const all = load();
    if (r.id) Object.assign(all.find((x) => x.id === r.id), d);
    else all.push({ id: crypto.randomUUID(), ...d });
    save(all);
    list();
  };
}

export function plan() {
  tabs('plan');
  const m = monday(week), wk = iso(m), meals = loadMeals(), slots = loadPlan()[wk] || {};
  const byId = Object.fromEntries(load().map((r) => [r.id, r]));
  const day = (i) => new Date(m.getFullYear(), m.getMonth(), m.getDate() + i);
  app.innerHTML = `<div class="weeknav"><button class="btn alt" data-w="-1" aria-label="Semana anterior">‹</button>
    <b>${short(day(0))} – ${short(day(6))}</b>
    <button class="btn alt" data-w="1" aria-label="Semana siguiente">›</button></div>
    <button class="chip" id="cfg">⚙ Configurar comidas</button>
    <div id="days">${DAYS.map((n, i) => `<section class="day"><h3>${n} <small>${short(day(i))}</small></h3>${meals.map((ml) => {
      const r = byId[slots[`${i}-${ml.id}`]];
      return `<button class="slot" data-s="${i}-${ml.id}"><span>${esc(ml.name)}${ml.time ? `<small>${esc(ml.time)}</small>` : ''}</span>${r ? `<b>${esc(r.title)}</b>` : '<em>+ Agregar</em>'}</button>`;
    }).join('')}</section>`).join('')}</div>`;
  app.querySelector('.weeknav').onclick = (e) => {
    const b = e.target.closest('[data-w]');
    if (b) { week += +b.dataset.w; plan(); }
  };
  app.querySelector('#cfg').onclick = mealsForm;
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
        <button type="button" class="ic" data-a="up" aria-label="Subir"${i ? '' : ' disabled'}>▲</button>
        <button type="button" class="ic" data-a="down" aria-label="Bajar"${i < ms.length - 1 ? '' : ' disabled'}>▼</button>
        <button type="button" class="ic" data-a="del" aria-label="Quitar"${ms.length > 1 ? '' : ' disabled'}>✕</button></div>`).join('')}
      <button class="chip" id="add">+ Agregar comida</button>
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
