const LS_KEY = 'bookmarks';
let showAll = false;

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function save(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }

function render() {
  const list = load();
  const ul = document.getElementById('bookmarks-list');
  const visible = showAll ? list : list.filter(b => !b.read);
  if (!visible.length) {
    ul.innerHTML = `<li style="color:var(--text-muted);font-size:0.75rem;padding:4px 8px">Keine Einträge</li>`;
    return;
  }
  ul.innerHTML = visible.map((b, _) => {
    const idx = list.indexOf(b);
    return `
      <li class="bookmark-item ${b.read ? 'read' : ''}" data-id="${b.id}">
        <a href="${b.url}" target="_blank" rel="noopener" title="${b.url}">${b.title || b.url}</a>
        <button class="bm-read-btn" data-id="${b.id}">${b.read ? '↩' : '✓'}</button>
        <button class="del-btn" data-id="${b.id}">✕</button>
      </li>`;
  }).join('');

  ul.querySelectorAll('.bm-read-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const list = load();
      const item = list.find(b => b.id === btn.dataset.id);
      if (item) { item.read = !item.read; save(list); render(); }
    });
  });
  ul.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const list = load();
      save(list.filter(b => b.id !== btn.dataset.id));
      render();
    });
  });
}

async function tryFetchTitle(url) {
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const json = await res.json();
    const match = json.contents?.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : null;
  } catch { return null; }
}

export function initBookmarks() {
  render();

  const urlIn    = document.getElementById('bookmark-url');
  const addBtn   = document.getElementById('bookmark-add');
  const toggleBtn = document.getElementById('bookmarks-toggle-read');

  async function addBookmark() {
    const url = urlIn.value.trim();
    if (!url) return;
    addBtn.textContent = '…';
    addBtn.disabled = true;
    const title = await tryFetchTitle(url);
    const list = load();
    list.unshift({ id: crypto.randomUUID(), url, title: title || url, addedAt: new Date().toISOString(), read: false });
    save(list);
    render();
    urlIn.value = '';
    addBtn.textContent = '+';
    addBtn.disabled = false;
  }

  addBtn.addEventListener('click', addBookmark);
  urlIn.addEventListener('keydown', e => { if (e.key === 'Enter') addBookmark(); });

  toggleBtn.addEventListener('click', () => {
    showAll = !showAll;
    toggleBtn.textContent = showAll ? 'Nur ungelesen' : 'Alle anzeigen';
    render();
  });
}
