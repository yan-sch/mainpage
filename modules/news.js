const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';
const CACHE_TTL = 15 * 60 * 1000;

const FEEDS = {
  general: [
    'https://www.tagesschau.de/xml/rss2/',
    'https://www.spiegel.de/schlagzeilen/index.rss',
  ],
  economy: [
    'https://www.handelsblatt.com/contentexport/feed/top-themen',
    'https://feeds.reuters.com/reuters/businessNews',
  ],
  ai: [
    'https://www.heise.de/rss/heise-atom.xml',
    'https://www.theverge.com/rss/index.xml',
  ],
  gaming: [
    'https://feeds.ign.com/ign/all',
    'https://www.eurogamer.net/?format=rss',
  ],
};

function cacheKey(widgetId, topic) { return `news_cache_${widgetId}_${topic}`; }

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600)  return Math.round(diff / 60) + ' Min.';
  if (diff < 86400) return Math.round(diff / 3600) + ' Std.';
  return Math.round(diff / 86400) + ' Tagen';
}

function renderSkeleton(listEl) {
  listEl.innerHTML = Array(5).fill(0).map(() =>
    `<li class="news-skeleton"><div class="skeleton-block"></div></li>`
  ).join('');
}

function renderError(listEl, widgetId, topic) {
  listEl.innerHTML = `
    <li class="news-error">
      Nachrichten konnten nicht geladen werden.
      <br><button class="retry-btn" id="news-retry-${widgetId}">Erneut versuchen</button>
    </li>`;
  document.getElementById(`news-retry-${widgetId}`)
    ?.addEventListener('click', () => loadNews(widgetId, topic));
}

function renderItems(listEl, items) {
  if (!items.length) {
    listEl.innerHTML = '<li class="news-error">Keine Artikel gefunden.</li>';
    return;
  }
  listEl.innerHTML = items.map(item => `
    <li class="news-item">
      <a href="${item.link}" target="_blank" rel="noopener">
        <div class="news-title">${item.title}</div>
        <div class="news-meta">${item.source} · vor ${timeAgo(item.pubDate)}</div>
      </a>
    </li>`).join('');
}

async function fetchFeed(rssUrl) {
  const url = RSS2JSON + encodeURIComponent(rssUrl);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 'ok') throw new Error('Feed error');
  const source = json.feed?.title ?? new URL(rssUrl).hostname;
  return (json.items ?? []).slice(0, 5).map(i => ({
    title:   i.title ?? '',
    link:    i.link ?? '#',
    pubDate: i.pubDate ?? '',
    source,
  }));
}

async function loadNews(widgetId, topic) {
  const listEl = document.getElementById(`news-list-${widgetId}`);
  if (!listEl) return;

  const key = cacheKey(widgetId, topic);
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const { ts, items } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) { renderItems(listEl, items); return; }
    } catch {}
  }

  renderSkeleton(listEl);

  const feeds = FEEDS[topic] ?? FEEDS.general;
  for (const feedUrl of feeds) {
    try {
      const items = await fetchFeed(feedUrl);
      if (items.length) {
        localStorage.setItem(key, JSON.stringify({ ts: Date.now(), items }));
        renderItems(listEl, items);
        return;
      }
    } catch {}
  }
  renderError(listEl, widgetId, topic);
}

function initWidget(widgetId) {
  const select = document.querySelector(`.news-topic-select[data-widget="${widgetId}"]`);
  if (!select) return;

  const saved = localStorage.getItem(`news_topic_${widgetId}`) || 'general';
  select.value = saved;

  loadNews(widgetId, saved);

  select.addEventListener('change', () => {
    const topic = select.value;
    localStorage.setItem(`news_topic_${widgetId}`, topic);
    loadNews(widgetId, topic);
  });
}

export function initNews() {
  initWidget(1);
  initWidget(2);
}
