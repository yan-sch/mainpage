import { defaultFavorites } from '../config.js';

const LS_KEY = 'favorites';

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || defaultFavorites; }
  catch { return defaultFavorites; }
}
function save(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }

function faviconUrl(url) {
  try { return `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`; }
  catch { return ''; }
}

function renderBar(list) {
  const bar = document.getElementById('favorites-bar');
  bar.innerHTML = list.map((fav, i) => {
    const furl = faviconUrl(fav.url);
    const imgHtml = furl
      ? `<img src="${furl}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fallback = `<span class="fav-fallback" ${furl ? 'style="display:none"' : ''}>${fav.label.charAt(0).toUpperCase()}</span>`;
    return `<a class="fav-item" href="${fav.url}" target="_blank" rel="noopener"
               data-label="${fav.label}" data-index="${i}">
              ${imgHtml}${fallback}
            </a>`;
  }).join('');
}

function renderEditList(list) {
  const ul = document.getElementById('fav-edit-list');
  ul.innerHTML = list.map((fav, i) => `
    <li class="fav-edit-item">
      <strong>${fav.label}</strong>
      <span>${fav.url}</span>
      <button class="fav-del-btn" data-index="${i}">✕</button>
    </li>`).join('');

  ul.querySelectorAll('.fav-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      const updated = list.filter((_, i) => i !== idx);
      save(updated);
      renderBar(updated);
      renderEditList(updated);
    });
  });
}

export function initFavorites() {
  let list = load();
  renderBar(list);

  const modal  = document.getElementById('fav-modal');
  const editBtn = document.getElementById('fav-edit-btn');
  const closeBtn = document.getElementById('fav-modal-close');
  const addBtn  = document.getElementById('fav-new-add');
  const labelIn = document.getElementById('fav-new-label');
  const urlIn   = document.getElementById('fav-new-url');

  editBtn.addEventListener('click', () => {
    list = load();
    renderEditList(list);
    modal.classList.remove('hidden');
  });
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  addBtn.addEventListener('click', () => {
    const lbl = labelIn.value.trim();
    const url = urlIn.value.trim();
    if (!lbl || !url) return;
    list = load();
    list.push({ label: lbl, url });
    save(list);
    renderBar(list);
    renderEditList(list);
    labelIn.value = '';
    urlIn.value = '';
  });

  [labelIn, urlIn].forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') addBtn.click(); });
  });
}
