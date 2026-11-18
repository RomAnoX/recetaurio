// Inline SVG icons, 24px grid, rounded strokes to match Fredoka. Colour comes from currentColor.
const P = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  cart: '<path d="M3 4h2.4l2.3 11h9.8l2.2-8.5H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="16.5" cy="19.5" r="1.3"/>',
  meals: '<path d="M6 3v6a2.5 2.5 0 0 0 5 0V3M8.5 3v18M17 21V3c-2.6 1.6-3.5 5-3.5 8H17"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  swap: '<path d="M8 20V4M4 8l4-4 4 4M16 4v16M12 16l4 4 4-4"/>',
  export: '<path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
  import: '<path d="M12 4v11M8 11l4 4 4-4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
  book: '<path d="M12 7c-1.7-1.6-4.2-2.2-8-2.2v13c3.8 0 6.3.6 8 2.2 1.7-1.6 4.2-2.2 8-2.2v-13c-3.8 0-6.3.6-8 2.2zM12 7v13"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="3.5"/><path d="M4 10.5h16M9 3v4M15 3v4"/>',
};

export const icon = (name, size = 20, stroke = 2.25) =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
