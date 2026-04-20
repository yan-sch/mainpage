import { searchEngines } from './config.js';
import { initWeather }    from './modules/weather.js';
import { initNews }       from './modules/news.js';
import { initFavorites }  from './modules/favorites.js';
import { initTimer }      from './modules/timer.js';
import { initBookmarks }  from './modules/bookmarks.js';
import { initQuote }      from './modules/quote.js';
import { initQuiz }       from './modules/quiz.js';

// ── Clock & Date ───────────────────────────────────────────────
const timeEl = document.getElementById('time-display');
const dateEl = document.getElementById('date-display');
const timeFmt = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const dateFmt = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function tick() {
  const now = new Date();
  timeEl.textContent = timeFmt.format(now);
  dateEl.textContent = dateFmt.format(now);
}
tick();
setInterval(tick, 1000);

// ── Search ─────────────────────────────────────────────────────
const engineSelect = document.getElementById('search-engine-select');
const searchInput  = document.getElementById('search-input');

const savedEngine = localStorage.getItem('search_engine') || 'google';
engineSelect.value = savedEngine;

engineSelect.addEventListener('change', () => {
  localStorage.setItem('search_engine', engineSelect.value);
});
searchInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const q = searchInput.value.trim();
  if (!q) return;
  const base = searchEngines[engineSelect.value] || searchEngines.google;
  window.open(base + encodeURIComponent(q), '_blank');
  searchInput.value = '';
});

// ── Init Modules ───────────────────────────────────────────────
initWeather();
initNews();
initFavorites();
initTimer();
initBookmarks();
initQuote();
initQuiz();
