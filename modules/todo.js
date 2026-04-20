const LS_KEY = 'todos';

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function save(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }

function render() {
  const list = load();
  const ul = document.getElementById('todo-list');
  if (!list.length) {
    ul.innerHTML = `<li style="color:var(--text-muted);font-size:0.75rem;padding:4px 8px">Keine Aufgaben</li>`;
    return;
  }
  ul.innerHTML = list.map(t => `
    <li class="todo-item ${t.done ? 'done' : ''}" data-id="${t.id}">
      <input type="checkbox" ${t.done ? 'checked' : ''} data-id="${t.id}" />
      <span class="todo-text">${escHtml(t.text)}</span>
      <button class="del-btn" data-id="${t.id}">✕</button>
    </li>`).join('');

  ul.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      const list = load();
      const item = list.find(t => t.id === cb.dataset.id);
      if (item) { item.done = cb.checked; save(list); render(); }
    });
  });
  ul.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      save(load().filter(t => t.id !== btn.dataset.id));
      render();
    });
  });
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function initTodo() {
  render();
  const inp      = document.getElementById('todo-input');
  const clearBtn = document.getElementById('todos-clear-done');

  function add() {
    const text = inp.value.trim();
    if (!text) return;
    const list = load();
    list.push({ id: crypto.randomUUID(), text, done: false, createdAt: new Date().toISOString() });
    save(list);
    render();
    inp.value = '';
  }

  inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  clearBtn.addEventListener('click', () => {
    save(load().filter(t => !t.done));
    render();
  });
}
