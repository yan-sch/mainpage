import { weather as cfg } from '../config.js';

const WMO_ICONS = {
  0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️',
  45:'🌫️', 48:'🌫️',
  51:'🌦️', 53:'🌦️', 55:'🌧️',
  61:'🌧️', 63:'🌧️', 65:'🌧️',
  71:'❄️', 73:'❄️', 75:'❄️', 77:'🌨️',
  80:'🌦️', 81:'🌧️', 82:'⛈️',
  85:'🌨️', 86:'🌨️',
  95:'⛈️', 96:'⛈️', 99:'⛈️',
};
const WMO_LABELS = {
  0:'Klarer Himmel', 1:'Überwiegend klar', 2:'Teilweise bewölkt', 3:'Bedeckt',
  45:'Nebel', 48:'Raureif',
  51:'Leichter Nieselregen', 53:'Nieselregen', 55:'Starker Nieselregen',
  61:'Leichter Regen', 63:'Regen', 65:'Starker Regen',
  71:'Leichter Schnee', 73:'Schnee', 75:'Starker Schnee', 77:'Schneekörner',
  80:'Leichte Schauer', 81:'Schauer', 82:'Starke Schauer',
  85:'Schneeschauer', 86:'Starke Schneeschauer',
  95:'Gewitter', 96:'Gewitter + Hagel', 99:'Heftiges Gewitter',
};
const DAYS_SHORT = ['So','Mo','Di','Mi','Do','Fr','Sa'];
const CACHE_KEY = 'weather_cache';
const CACHE_TTL = 30 * 60 * 1000;

function icon(code) { return WMO_ICONS[code] ?? '🌡️'; }
function label(code) { return WMO_LABELS[code] ?? 'Unbekannt'; }

function formatTemp(t) { return Math.round(t) + '°'; }

async function fetchWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${cfg.latitude}&longitude=${cfg.longitude}&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Berlin&forecast_days=3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function renderWeather(data) {
  const c = data.current;
  const d = data.daily;
  const el = document.getElementById('weather-content');

  const forecastHTML = [0, 1, 2].map(i => {
    const date = new Date(d.time[i]);
    const dayLabel = i === 0 ? 'Heute' : i === 1 ? 'Morgen' : DAYS_SHORT[date.getDay()];
    return `
      <div class="forecast-day">
        <div class="f-label">${dayLabel}</div>
        <div class="f-icon">${icon(d.weathercode[i])}</div>
        <div class="f-temps">${formatTemp(d.temperature_2m_max[i])} <span>${formatTemp(d.temperature_2m_min[i])}</span></div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div id="weather-city">${cfg.city}</div>
    <div id="weather-main">
      <div id="weather-icon">${icon(c.weathercode)}</div>
      <div id="weather-temp-wrap">
        <div id="weather-temp">${formatTemp(c.temperature_2m)}</div>
        <div id="weather-desc">${label(c.weathercode)}</div>
      </div>
    </div>
    <div id="weather-meta">
      <span>Gefühlt ${formatTemp(c.apparent_temperature)}</span>
      <span>💨 ${Math.round(c.windspeed_10m)} km/h</span>
    </div>
    <div id="weather-forecast">${forecastHTML}</div>`;
}

function renderError(msg) {
  const el = document.getElementById('weather-content');
  el.innerHTML = `
    <div id="weather-error">${msg}</div>
    <button class="retry-btn" id="weather-retry">Erneut versuchen</button>`;
  document.getElementById('weather-retry').addEventListener('click', load);
}

async function load() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { ts, data } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) { renderWeather(data); return; }
    } catch {}
  }
  try {
    const data = await fetchWeather();
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    renderWeather(data);
  } catch (e) {
    renderError('Wetterdaten konnten nicht geladen werden.');
  }
}

export function initWeather() { load(); }
