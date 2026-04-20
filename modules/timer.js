const PHASES = [
  { name: 'Arbeit',       duration: 25 * 60, class: 'work'  },
  { name: 'Kurze Pause',  duration:  5 * 60, class: 'break' },
  { name: 'Arbeit',       duration: 25 * 60, class: 'work'  },
  { name: 'Kurze Pause',  duration:  5 * 60, class: 'break' },
  { name: 'Arbeit',       duration: 25 * 60, class: 'work'  },
  { name: 'Kurze Pause',  duration:  5 * 60, class: 'break' },
  { name: 'Arbeit',       duration: 25 * 60, class: 'work'  },
  { name: 'Lange Pause',  duration: 15 * 60, class: 'break' },
];

const LS_COUNT  = 'pomodoro_today';
const LS_DATE   = 'pomodoro_date';
const TITLE_BASE = 'Startseite';

let intervalId   = null;
let phaseIndex   = 0;
let remaining    = PHASES[0].duration;
let pomodorosDone = 0;

const displayEl   = document.getElementById('timer-display');
const phaseLabel  = document.getElementById('timer-phase-label');
const dotsEl      = document.getElementById('timer-dots');
const startBtn    = document.getElementById('timer-start');
const pauseBtn    = document.getElementById('timer-pause');
const resetBtn    = document.getElementById('timer-reset');
const countEl     = document.getElementById('timer-count');
const timerEl     = document.getElementById('timer');

function fmt(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateDisplay() {
  displayEl.textContent = fmt(remaining);
  phaseLabel.textContent = PHASES[phaseIndex].name;
  timerEl.className = 'card ' + PHASES[phaseIndex].class;
  updateDots();
}

function updateDots() {
  const dots = dotsEl.querySelectorAll('.dot');
  dots.forEach((d, i) => {
    d.classList.toggle('done', i < (pomodorosDone % 4));
  });
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {}
}

function nextPhase() {
  const currentPhase = PHASES[phaseIndex];
  if (currentPhase.class === 'work') {
    pomodorosDone++;
    saveTodayCount();
    countEl.textContent = pomodorosDone;
  }
  phaseIndex = (phaseIndex + 1) % PHASES.length;
  remaining = PHASES[phaseIndex].duration;
  beep();
  updateDisplay();
  document.title = `🍅 ${fmt(remaining)} — ${TITLE_BASE}`;
}

function tick() {
  if (remaining > 0) {
    remaining--;
    updateDisplay();
    document.title = `🍅 ${fmt(remaining)} — ${TITLE_BASE}`;
  } else {
    nextPhase();
  }
}

function start() {
  if (intervalId) return;
  intervalId = setInterval(tick, 1000);
  startBtn.disabled = true;
  pauseBtn.disabled = false;
}

function pause() {
  clearInterval(intervalId);
  intervalId = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function reset() {
  pause();
  phaseIndex = 0;
  remaining = PHASES[0].duration;
  updateDisplay();
  document.title = TITLE_BASE;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function saveTodayCount() {
  const today = new Date().toISOString().slice(0, 10);
  const saved = localStorage.getItem(LS_DATE);
  if (saved !== today) {
    localStorage.setItem(LS_DATE, today);
    localStorage.setItem(LS_COUNT, '0');
  }
  localStorage.setItem(LS_COUNT, String(pomodorosDone));
}

function loadTodayCount() {
  const today = new Date().toISOString().slice(0, 10);
  const saved = localStorage.getItem(LS_DATE);
  if (saved === today) {
    pomodorosDone = parseInt(localStorage.getItem(LS_COUNT) || '0', 10);
  }
  countEl.textContent = pomodorosDone;
}

export function initTimer() {
  loadTodayCount();
  updateDisplay();
  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', pause);
  resetBtn.addEventListener('click', reset);
}
