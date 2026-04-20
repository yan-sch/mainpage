const LS_KEY = 'quiz_state';

const LEVELS = [
  { level: 1, xp: 0,    name: 'Beginner'   },
  { level: 2, xp: 100,  name: 'Lernender'  },
  { level: 3, xp: 300,  name: 'Entwickler' },
  { level: 4, xp: 700,  name: 'Senior Dev' },
  { level: 5, xp: 1500, name: 'Architekt'  },
  { level: 6, xp: 3000, name: 'Tech Lead'  },
];

const ACHIEVEMENTS = [
  { id: 'first_correct',   label: '⭐ Erster Schritt',   check: s => s.history.filter(h=>h.correct).length >= 1 },
  { id: 'week_warrior',    label: '🔥 Wochenkämpfer',    check: s => s.currentStreak >= 7 },
  { id: 'unstoppable',     label: '💎 Unaufhaltbar',     check: s => s.currentStreak >= 30 },
  { id: 'combo_king',      label: '⚡ Combo King',        check: s => s.bestSessionStreak >= 10 },
  { id: 'quick_thinker',   label: '🚀 Schnelldenker',    check: s => {
    const today = new Date().toISOString().slice(0,10);
    return s.history.filter(h=>h.correct && h.date===today).length >= 10;
  }},
  { id: 'level5',          label: '🏆 Level 5 erreicht', check: s => s.xp >= 1500 },
  { id: 'category_master', label: '🎓 Kategorie-Meister', check: (s, pool) => {
    const cats = [...new Set(pool.map(q=>q.kategorie))];
    return cats.some(cat => {
      const catQs = pool.filter(q=>q.kategorie===cat);
      const correct = s.history.filter(h=>h.correct && h.category===cat).map(h=>h.id);
      return catQs.every(q => correct.includes(q.id));
    });
  }},
];

const XP_TABLE = { 1: 10, 2: 15, 3: 25 };

function defaultState() {
  return {
    xp: 0, level: 1,
    currentStreak: 0, longestStreak: 0,
    lastActiveDate: null, bestSessionStreak: 0,
    history: [],
    achievements: [],
    activeFilter: { kategorie: 'Alle', level: 'Alle' },
    todayCorrect: 0, todayWrong: 0, todayBestCombo: 0,
    todayDate: null,
  };
}

function loadState() {
  try { return { ...defaultState(), ...JSON.parse(localStorage.getItem(LS_KEY)) }; }
  catch { return defaultState(); }
}
function saveState(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }

function getLevelInfo(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.xp) current = l; else break; }
  const nextLevel = LEVELS.find(l => l.xp > xp);
  const prevXp = current.xp;
  const nextXp = nextLevel ? nextLevel.xp : current.xp + 1;
  const pct = Math.min(100, Math.round(((xp - prevXp) / (nextXp - prevXp)) * 100));
  return { ...current, pct, nextXp };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Confetti ──────────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const colors = ['#6c63ff','#22c55e','#f59e0b','#ef4444','#38bdf8'];
  const particles = Array.from({ length: 40 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.4,
    r: 4 + Math.random() * 5,
    dx: (Math.random() - 0.5) * 3,
    dy: 2 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 1,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      p.x  += p.dx;
      p.y  += p.dy;
      p.dy += 0.12;
      p.alpha -= 0.018;
    });
    ctx.globalAlpha = 1;
    if (++frame < 70) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ── Module State ──────────────────────────────────────────────
let allQuestions = [];
let queue = [];
let sessionCombo = 0;
let state = loadState();
let answerLocked = false;

// ── DOM refs ──────────────────────────────────────────────────
const streakEl   = document.getElementById('quiz-streak');
const comboEl    = document.getElementById('quiz-combo');
const levelEl    = document.getElementById('quiz-level-display');
const xpEl       = document.getElementById('quiz-xp-display');
const xpBar      = document.getElementById('quiz-xp-bar');
const qEl        = document.getElementById('quiz-question');
const answersEl  = document.getElementById('quiz-answers');
const explEl     = document.getElementById('quiz-explanation');
const xpFloat    = document.getElementById('quiz-xp-float');
const statsBtn   = document.getElementById('quiz-stats-btn');
const statsPanel = document.getElementById('quiz-stats-panel');

// ── Streak maintenance ────────────────────────────────────────
function updateStreak() {
  const today = new Date().toISOString().slice(0,10);
  if (state.lastActiveDate === null) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  if (state.lastActiveDate !== today && state.lastActiveDate !== yesterday) {
    state.currentStreak = 0;
  }
}

function touchStreak() {
  const today = new Date().toISOString().slice(0,10);
  if (state.lastActiveDate !== today) {
    state.currentStreak++;
    if (state.currentStreak > state.longestStreak) state.longestStreak = state.currentStreak;
    state.lastActiveDate = today;
    // reset daily stats
    if (state.todayDate !== today) {
      state.todayDate = today;
      state.todayCorrect = 0;
      state.todayWrong = 0;
      state.todayBestCombo = 0;
    }
  }
}

// ── UI Updates ────────────────────────────────────────────────
function updateHeader() {
  const li = getLevelInfo(state.xp);
  streakEl.textContent = `🔥 ${state.currentStreak}`;
  levelEl.textContent  = `Lv.${li.level} ${li.name}`;
  xpEl.textContent     = `${state.xp} XP`;
  xpBar.style.width    = li.pct + '%';
  if (sessionCombo >= 3) {
    comboEl.textContent = `⚡ ${sessionCombo}× Combo`;
  } else {
    comboEl.textContent = '';
  }
}

// ── Queue ─────────────────────────────────────────────────────
function buildQueue() {
  let pool = allQuestions;
  const f = state.activeFilter;
  if (f.kategorie !== 'Alle') pool = pool.filter(q => q.kategorie === f.kategorie);
  if (f.level !== 'Alle')     pool = pool.filter(q => q.level === parseInt(f.level, 10));
  if (!pool.length) pool = allQuestions;
  queue = shuffle(pool);
}

function nextQuestion() {
  if (!queue.length) buildQueue();
  const q = queue.shift();
  showQuestion(q);
}

function showQuestion(q) {
  answerLocked = false;
  explEl.classList.add('hidden');
  xpFloat.classList.add('hidden');
  qEl.textContent = q.frage;
  answersEl.innerHTML = '';
  q.antworten.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = ans;
    btn.addEventListener('click', () => onAnswer(q, i, btn));
    answersEl.appendChild(btn);
  });
}

function onAnswer(q, chosenIdx, btn) {
  if (answerLocked) return;
  answerLocked = true;

  const correct = chosenIdx === q.korrekteAntwortIndex;
  const today   = new Date().toISOString().slice(0,10);

  touchStreak();

  const baseXp = XP_TABLE[q.level] ?? 10;
  let gained = 0;

  if (correct) {
    sessionCombo++;
    if (sessionCombo > state.bestSessionStreak) state.bestSessionStreak = sessionCombo;
    if (sessionCombo > (state.todayBestCombo ?? 0)) state.todayBestCombo = sessionCombo;
    const mult = sessionCombo >= 10 ? 2 : sessionCombo >= 5 ? 1.5 : 1;
    gained = Math.round(baseXp * mult);
    state.todayCorrect = (state.todayCorrect ?? 0) + 1;
    btn.classList.add('correct');
    launchConfetti();
    showXpFloat(`+${gained} XP`);

    const prevLevel = getLevelInfo(state.xp).level;
    state.xp += gained;
    const newLevel = getLevelInfo(state.xp).level;
    if (newLevel > prevLevel) showLevelUp(newLevel);
  } else {
    sessionCombo = 0;
    state.todayWrong = (state.todayWrong ?? 0) + 1;
    btn.classList.add('wrong');
    answersEl.querySelectorAll('.answer-btn')[q.korrekteAntwortIndex].classList.add('correct');
    answersEl.classList.add('shake');
    setTimeout(() => answersEl.classList.remove('shake'), 400);
  }

  answersEl.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);

  if (q.erklaerung) {
    explEl.textContent = q.erklaerung;
    explEl.classList.remove('hidden');
  }

  state.history.push({ id: q.id, correct, date: today, category: q.kategorie, level: q.level });
  if (state.history.length > 500) state.history = state.history.slice(-500);

  checkAchievements();
  updateHeader();
  saveState(state);

  setTimeout(nextQuestion, 1500);
}

function showXpFloat(text) {
  xpFloat.textContent = text;
  xpFloat.classList.remove('hidden');
  xpFloat.style.animation = 'none';
  requestAnimationFrame(() => {
    xpFloat.style.animation = '';
    xpFloat.classList.remove('hidden');
  });
  setTimeout(() => xpFloat.classList.add('hidden'), 1300);
}

function showLevelUp(lvl) {
  const info = LEVELS.find(l => l.level === lvl) || {};
  const banner = document.createElement('div');
  banner.id = 'level-up-banner';
  banner.innerHTML = `<div class="level-up-title">🎉 Level ${lvl}!</div>
    <div class="level-up-sub">${info.name}</div>`;
  document.getElementById('quiz').appendChild(banner);
  setTimeout(() => banner.remove(), 2600);
}

// ── Achievements ──────────────────────────────────────────────
function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (state.achievements.includes(a.id)) return;
    if (a.check(state, allQuestions)) {
      state.achievements.push(a.id);
    }
  });
}

// ── Stats Panel ───────────────────────────────────────────────
function renderStats() {
  const today   = new Date().toISOString().slice(0,10);
  const li      = getLevelInfo(state.xp);
  const total   = state.history.length;
  const correct = state.history.filter(h=>h.correct).length;
  const pctAll  = total ? Math.round((correct/total)*100) : 0;

  const cats = [...new Set(allQuestions.map(q=>q.kategorie))];
  const catBars = cats.map(cat => {
    const catQs  = state.history.filter(h=>h.category===cat);
    const catOk  = catQs.filter(h=>h.correct).length;
    const pct    = catQs.length ? Math.round((catOk/catQs.length)*100) : 0;
    return `<div class="stats-cat-row">
      <span class="stats-cat-name">${cat}</span>
      <div class="stats-bar-wrap"><div class="stats-bar-fill" style="width:${pct}%"></div></div>
      <span class="stats-cat-pct">${pct}%</span>
    </div>`;
  }).join('');

  const badges = ACHIEVEMENTS.filter(a => state.achievements.includes(a.id))
    .map(a => `<span class="achievement-badge">${a.label}</span>`).join('') || '<span style="color:var(--text-muted);font-size:0.75rem">Noch keine Errungenschaften</span>';

  statsPanel.innerHTML = `
    <div class="stats-row">
      <span class="stats-badge">🔥 ${state.currentStreak} Streak</span>
      <span class="stats-badge">✓ ${state.todayCorrect ?? 0} Heute richtig</span>
      <span class="stats-badge">✗ ${state.todayWrong ?? 0} Heute falsch</span>
      <span class="stats-badge">⚡ ${state.todayBestCombo ?? 0}× Bestcombo</span>
    </div>
    <div class="stats-row">
      <span class="stats-badge">Lv.${li.level} ${li.name}</span>
      <span class="stats-badge">${state.xp} XP</span>
      <span class="stats-badge">Ø ${pctAll}% korrekt</span>
      <span class="stats-badge">Längste Streak: ${state.longestStreak}</span>
    </div>
    <div class="stats-cat-bar">${catBars}</div>
    <div id="quiz-achievements">${badges}</div>`;
}

// ── Filters ───────────────────────────────────────────────────
function initFilters() {
  const f = state.activeFilter;

  document.querySelectorAll('[data-kat]').forEach(btn => {
    if (btn.dataset.kat === f.kategorie) btn.classList.add('active');
    else btn.classList.remove('active');
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-kat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter.kategorie = btn.dataset.kat;
      saveState(state);
      buildQueue();
      nextQuestion();
    });
  });

  document.querySelectorAll('[data-lvl]').forEach(btn => {
    if (btn.dataset.lvl === f.level) btn.classList.add('active');
    else btn.classList.remove('active');
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-lvl]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter.level = btn.dataset.lvl;
      saveState(state);
      buildQueue();
      nextQuestion();
    });
  });
}

// ── Stats toggle ──────────────────────────────────────────────
statsBtn.addEventListener('click', () => {
  const hidden = statsPanel.classList.toggle('hidden');
  if (!hidden) renderStats();
});

// ── Init ──────────────────────────────────────────────────────
export async function initQuiz() {
  updateStreak();
  updateHeader();
  initFilters();
  qEl.textContent = 'Lade Fragen…';
  try {
    const res = await fetch('./data/questions.json');
    allQuestions = await res.json();
  } catch (e) {
    qEl.textContent = 'Fehler beim Laden der Fragen.';
    console.error('Quiz load error:', e);
    return;
  }
  // Validate saved filter against actual categories
  const validCats = new Set(['Alle', ...allQuestions.map(q => q.kategorie)]);
  if (!validCats.has(state.activeFilter.kategorie)) {
    state.activeFilter.kategorie = 'Alle';
    saveState(state);
    document.querySelectorAll('[data-kat]').forEach(b =>
      b.classList.toggle('active', b.dataset.kat === 'Alle'));
  }
  buildQueue();
  nextQuestion();
}
