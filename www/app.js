import { DINO, list } from './views.js';
import { migratePhotos } from './store.js';

await migratePhotos();
list();
document.getElementById('mascot').innerHTML = DINO;
