const KEY = 'recetaurio.recipes';
const app = document.getElementById('app');

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};
const save = (list) => localStorage.setItem(KEY, JSON.stringify(list));

const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const lines = (s) => s.split('\n').map((l) => l.trim()).filter(Boolean);

const DINO = `<img src="dino.png" alt="Dino chef">`;

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const CATS = ['Desayuno', 'Comida', 'Cena', 'Postre', 'Bebida', 'Botana'];
let cat = '';

function rows(recipes, q) {
  const n = norm(q.trim());
  const hits = recipes.filter((r) => (!cat || r.category === cat) && norm(`${r.title}\n${r.ingredients}`).includes(n));
  if (!hits.length) return `<p class="none">Sin resultados.</p>`;
  return `<ul class="recipes">${hits.map((r) => `<li><button class="card" data-id="${r.id}">
    <span class="dot" aria-hidden="true">${esc(r.title[0].toUpperCase())}</span>
    <span><b>${esc(r.title)}</b><small>${r.category ? esc(r.category) + ' · ' : ''}${lines(r.ingredients).length} ingredientes</small></span>
    </button></li>`).join('')}</ul>`;
}

function list() {
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

list();
document.getElementById('mascot').innerHTML = DINO;
