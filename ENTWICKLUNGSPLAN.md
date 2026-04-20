# Entwicklungsplan: Persönliche Browser-Startseite

> Ziel: Statische, schnell ladende Startseite als persönliches Daily Control Center.
> Hosting: GitHub Pages | Stack: Vanilla HTML / CSS / JS

---

## Projektstruktur

```
mainpage/
├── index.html
├── style.css
├── main.js
├── assets/
│   └── icons/           # Favicon-Icons für Favoriten (SVG bevorzugt)
├── data/
│   └── questions.json   # 300 Quiz-Fragen (bereits vorhanden)
├── modules/
│   ├── weather.js       # Wetter-Widget Logik
│   ├── news.js          # News-Widget Logik
│   ├── favorites.js     # Favoriten-Dashboard
│   ├── timer.js         # Pomodoro-Timer
│   ├── bookmarks.js     # Leseliste
│   ├── todo.js          # To-do Liste
│   └── quiz.js          # Quiz-Widget
└── config.js            # Zentrale Konfiguration (API-Keys, URLs, etc.)
```

---

## Design System (zuerst festlegen)

### Farbpalette (Dark Mode)

```css
--bg-primary:    #0f1117   /* Hintergrund Seite */
--bg-card:       #1a1d27   /* Widget-Karten */
--bg-hover:      #252836   /* Hover-Zustand */
--accent:        #6c63ff   /* Primär-Akzent (Violett) */
--accent-green:  #22c55e   /* Erfolg / Richtig */
--accent-red:    #ef4444   /* Fehler / Falsch */
--text-primary:  #f1f5f9   /* Haupttext */
--text-muted:    #94a3b8   /* Sekundärtext */
--border:        #2d3149   /* Karten-Rahmen */
```

### Typografie

- Font: `Inter` (Google Fonts, 1 Request)
- Größen: `xs 0.75rem` | `sm 0.875rem` | `base 1rem` | `lg 1.125rem` | `xl 1.25rem` | `2xl 1.5rem`

### Grid-Layout (CSS Grid)

```
Desktop (≥1280px):
┌──────────────────────────────────────────────────────┐
│  [Uhrzeit/Datum]              [Suchleiste]            │
├──────────┬───────────────────────┬───────────────────┤
│  Wetter  │  News [Dropdown▼]     │  News [Dropdown▼] │
│          │  (gleiche Breite)     │  (gleiche Breite) │
├──────────┴───────────────────────┴───────────────────┤
│  [⬡] [⬡] [⬡] [⬡] [⬡] [⬡] [⬡] [⬡]  ← Favoriten   │  ← schmal, volle Breite, nur Icons
├──────────┬────────────────────────────────────────────┤
│ Pomodoro │                                            │
├──────────┤    Quiz Widget  (2 Spalten breit)          │
│Bookmarks │                                            │
│+ To-dos  │                                            │
└──────────┴────────────────────────────────────────────┘

Tablet (768px–1279px): 2-Spalten, Favoriten-Leiste bleibt horizontal
Mobil (<768px): 1-Spalte, Favoriten-Leiste scrollbar horizontal
```

**CSS Grid Definition (Desktop):**
```css
#grid {
  display: grid;
  grid-template-columns: 240px 1fr 1fr;
  grid-template-rows: auto 40px auto auto;
  gap: 12px;
}
#weather        { grid-column: 1;     grid-row: 1; }
#news-1         { grid-column: 2;     grid-row: 1; }   /* gleiche Breite wie #news-2 */
#news-2         { grid-column: 3;     grid-row: 1; }   /* gleiche Breite wie #news-1 */
#favorites      { grid-column: 1 / -1; grid-row: 2; }  /* volle Breite, schmal */
#timer          { grid-column: 1;     grid-row: 3; }
#bookmarks-todos{ grid-column: 1;     grid-row: 4; }
#quiz           { grid-column: 2 / 4; grid-row: 3 / 5; } /* 2 Spalten × 2 Zeilen */
```

---

## Phase 1 – MVP: Grundgerüst + Kerninhalte

### Schritt 1.1 – index.html Grundstruktur

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Startseite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header id="header">        <!-- Uhrzeit, Datum, Suche -->
  <main id="grid">
    <section id="weather">    <!-- Wetter -->
    <section id="news-1">         <!-- News Widget 1 (Topic per Dropdown) -->
    <section id="news-2">         <!-- News Widget 2 (Topic per Dropdown) -->
    <section id="quiz">       <!-- Quiz -->
    <section id="favorites">  <!-- Favoriten -->
    <section id="timer">      <!-- Pomodoro -->
    <section id="bookmarks">  <!-- Leseliste -->
    <section id="todos">      <!-- To-dos -->
  </main>
  <script type="module" src="main.js"></script>
</body>
</html>
```

### Schritt 1.2 – Header: Uhrzeit + Datum + Suchleiste

**Uhrzeit (JS):**
- `setInterval(() => ..., 1000)` mit `Intl.DateTimeFormat` für Locale-korrekte Ausgabe
- Format: `Sonntag, 20. April 2026  —  14:32:07`

**Suchleiste:**
- Standard: Google (`https://www.google.com/search?q=`)
- Suchmaschine via `config.js` wechselbar (DuckDuckGo, Kagi, Perplexity)
- `Enter`-Taste öffnet Suche in neuem Tab

### Schritt 1.3 – Wetter-Widget

**API:** [Open-Meteo](https://open-meteo.com/) — kostenlos, kein API-Key nötig

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=48.1351
  &longitude=11.5820
  &current=temperature_2m,weathercode,windspeed_10m
  &daily=temperature_2m_max,temperature_2m_min,weathercode
  &timezone=Europe/Berlin
  &forecast_days=3
```

**Standort:** Koordinaten in `config.js` speichern (kein Geolocation-Prompt nötig)

**Anzeige:**
- Wettericon (SVG-Sprite basierend auf WMO-Weathercode)
- Aktuelle Temperatur groß
- Gefühlt / Wind klein
- 3-Tage-Vorschau als Ministreifen

**Caching:** `localStorage` mit Timestamp, Refresh alle 30 Minuten

### Schritt 1.4 – Favoriten-Leiste (Icon-Bar)

**Position:** Schmale horizontale Leiste (ca. 40–48px Höhe) zwischen News-Reihe und unterem Bereich.

**Konfiguration** in `config.js`:

```js
export const favorites = [
  { label: "Mail",    url: "https://mail.google.com",  icon: "gmail" },
  { label: "GitHub",  url: "https://github.com",       icon: "github" },
  { label: "ChatGPT", url: "https://chat.openai.com",  icon: "chatgpt" },
  { label: "YouTube", url: "https://youtube.com",       icon: "youtube" },
  // ...
];
```

**Darstellung:**
- Horizontale Reihe von Icon-Buttons, gleichmäßig verteilt (`display: flex; justify-content: center; gap: 8px`)
- Nur Icon sichtbar (32×32px Favicon oder SVG)
- **Label erscheint als Tooltip beim Hover:** CSS `::after` Pseudo-Element, kein JS nötig
- Icons: Favicon via `https://www.google.com/s2/favicons?sz=64&domain=github.com`, Fallback: Initiale im Akzentfarben-Kreis
- Klick öffnet URL in neuem Tab

**Hover-Tooltip CSS:**
```css
.fav-item {
  position: relative;
}
.fav-item::after {
  content: attr(data-label);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  border: 1px solid var(--border);
}
.fav-item:hover::after { opacity: 1; }
```

**Edit-Modus:** Langer Klick (500ms) oder separates ⚙-Icon am Leisten-Rand öffnet Mini-Modal zum Hinzufügen/Entfernen von Einträgen. Änderungen in `localStorage` gespeichert (überschreibt `config.js`-Defaults).

### Schritt 1.5 – News-Widgets (2× identische Widgets, Topic per Dropdown)

Beide Widgets sind **gleich groß** (je `1fr` Breite) und haben dieselbe Struktur.
Jedes Widget hat einen **Dropdown im Header**, über den der Nutzer das Thema unabhängig wählt.
Die Auswahl wird pro Widget in `localStorage` gespeichert.

**Dropdown-Optionen:**
```
[ News allgemein | Wirtschaft | AI | Gaming ]
```

**Problem:** Direkte News-APIs (NewsAPI.org) blockieren Browser-Requests per CORS.

**Lösung A (empfohlen für MVP):** RSS-to-JSON via `https://api.rss2json.com/v1/api.json?rss_url=...`
- Kostenlos bis 10.000 Req/Monat
- Keine CORS-Probleme

**RSS-Quellen nach Topic:**

| Topic | Quelle | RSS-URL |
|-------|--------|---------|
| News allgemein | Tagesschau | `https://www.tagesschau.de/xml/rss2/` |
| News allgemein | Spiegel Online | `https://www.spiegel.de/schlagzeilen/index.rss` |
| Wirtschaft | Handelsblatt | `https://www.handelsblatt.com/contentexport/feed/top-themen` |
| Wirtschaft | Reuters Business | `https://feeds.reuters.com/reuters/businessNews` |
| AI | Heise Online | `https://www.heise.de/rss/heise-atom.xml` |
| AI | The Verge | `https://www.theverge.com/rss/index.xml` |
| Gaming | IGN | `https://feeds.ign.com/ign/all` |
| Gaming | Eurogamer | `https://www.eurogamer.net/?format=rss` |

**Widget-HTML-Struktur:**
```html
<section id="news-1" class="news-widget">
  <header class="news-header">
    <span class="news-icon">📰</span>
    <select class="news-topic-select">
      <option value="general">News allgemein</option>
      <option value="economy">Wirtschaft</option>
      <option value="ai">AI</option>
      <option value="gaming">Gaming</option>
    </select>
  </header>
  <ul class="news-list"><!-- Headlines werden per JS eingefügt --></ul>
</section>
```

**Anzeige:**
- 5 Headlines mit Quellenname + Zeitstempel
- Klick öffnet Link in neuem Tab
- Loading-Skeleton während Fetch
- Fehlerfall: Fehlermeldung + Retry-Button
- Caching: 15 Minuten in `localStorage` (pro Topic + Widget-ID)
- Topic-Wechsel im Dropdown löst sofort neuen Fetch aus

---

## Phase 2 – Produktivität

### Schritt 2.1 – Pomodoro-Timer (Position: unten links)

**Position im Grid:** `grid-column: 1; grid-row: 3` — untere linke Zelle.

**Logik:**
```
States: idle → running → paused → break → idle
Zeiten: Work 25min | Short Break 5min | Long Break 15min (nach 4 Pomodoros)
```

**Features:**
- Großer Countdown (zentriert in der Karte)
- Start / Pause / Reset Buttons
- Optionaler Ton bei Ende (`AudioContext` Web API, kein Asset nötig)
- Tages-Counter im `localStorage` (wie viele Pomodoros heute)
- Browser-Tab-Titel zeigt Countdown: `🍅 23:45 — Startseite`
- Phasen-Indikator: 4 kleine Kreise zeigen Fortschritt im Pomodoro-Zyklus

### Schritt 2.2 – Bookmark / Leseliste

**Datenmodell (localStorage):**
```js
{
  id: crypto.randomUUID(),
  url: "https://...",
  title: "Artikel-Titel",
  addedAt: ISO-Date,
  read: false,
  tags: []
}
```

**Features:**
- URL einfügen → Titel per `fetch` + DOM-Parser auslesen (via CORS-Proxy falls nötig)
- Fallback: Manueller Titel
- Liste sortierbar (ungelesen zuerst)
- Checkbox „gelesen" — gelesene werden ausgeblendet (per Toggle anzeigbar)

### Schritt 2.3 – Mini To-do

**Datenmodell (localStorage):**
```js
{ id, text, done, createdAt }
```

**Features:**
- Eingabe + Enter → hinzufügen
- Klick auf Task → erledigt (Durchstrich)
- `×` zum Löschen
- „Alle erledigten löschen"-Button
- Keine Persistenz über Browser-Sessions hinaus nötig (für spontane Tagesaufgaben)

---

## Phase 3 – Quiz Widget

**Position im Grid:** `grid-column: 2; grid-row: 3` — untere Mitte.

### Datenquelle: questions.json

Die Datei `questions.json` enthält 300 Fragen mit folgendem Schema:

```json
{
  "id": 1,
  "kategorie": "Webentwicklung",
  "level": 1,
  "frage": "...",
  "antworten": ["A", "B", "C"],
  "korrekteAntwortIndex": 1,
  "erklaerung": "..."
}
```

Verfügbare Kategorien aus der Datei: `Webentwicklung`, `Code`, `KI`, `Tools` (ggf. mehr).
Verfügbare Level: `1` (leicht) bis `3` (schwer) — exakt je nach Datei prüfen.

---

### Quiz-Logik in quiz.js

#### Fragen-Queue (kein „nur eine Frage pro Tag" mehr)

```
1. Beim Start: Pool aus questions.json laden, nach aktiven Filtern filtern
2. Pool shuffeln (Fisher-Yates)
3. Erste Frage anzeigen
4. Nach Beantwortung: 1,5s Feedback-Pause → automatisch nächste Frage
5. Wenn Pool erschöpft: Pool neu shuffeln, von vorne (keine Frage doppelt
   solange noch unbeantwortete im Pool sind)
```

#### Filter-Leiste (oberhalb der Frage)

```
Kategorie: [Alle] [Webentwicklung] [Code] [KI] [Tools]
Level:     [Alle] [★☆☆] [★★☆] [★★★]
```
- Filteränderung verwirft aktuelle Queue, baut neue Queue sofort auf
- Aktiver Filter wird im `localStorage` gespeichert und beim nächsten Öffnen wiederhergestellt

#### Antwort-Ablauf

```
1. Frage + 3 Antwort-Buttons anzeigen
2. Nutzer klickt → sofortige Auswertung (kein Submit-Button)
3. Richtig:  Button grün + Konfetti-Burst (~30 Partikel, Canvas-Overlay)
             Punkte-Animation: "+10 XP" floated kurz auf
4. Falsch:   Geklickter Button rot + korrekte Antwort grün markiert
5. Erklärungstext einblenden (sanftes fade-in)
6. Nach 1,5s automatisch nächste Frage laden (oder sofort per Klick überspringen)
```

---

### Gamification-System

#### Punkte / XP

| Ereignis | Punkte |
|----------|--------|
| Richtige Antwort | +10 XP |
| Richtig, Level 2 | +15 XP |
| Richtig, Level 3 | +25 XP |
| Session-Streak ×2 (5 richtig in Folge) | Multiplikator ×1,5 |
| Session-Streak ×3 (10 richtig in Folge) | Multiplikator ×2 |

#### Tages-Streak

```js
{
  currentStreak: 7,         // aufeinanderfolgende Tage mit ≥1 beantworteter Frage
  longestStreak: 14,
  lastActiveDate: "2026-04-20"
}
```
- Streak bricht ab wenn 1 Tag ohne Antwort vergeht
- Anzeige: `🔥 7` prominent im Widget-Header

#### Session-Streak (innerhalb einer Sitzung)

- Zählt konsekutive richtige Antworten ohne Fehler
- Anzeige als Combo-Zähler: `⚡ 5× Combo`
- Bei Fehler: Combo-Zähler bricht, kurze Shake-Animation
- Bester Session-Streak des Tages wird gespeichert

#### Level-System (Gesamt-XP basiert)

| Level | XP-Schwelle | Bezeichnung |
|-------|-------------|-------------|
| 1 | 0 | Beginner |
| 2 | 100 | Lernender |
| 3 | 300 | Entwickler |
| 4 | 700 | Senior Dev |
| 5 | 1500 | Architekt |
| 6 | 3000 | Tech Lead |

- Level-Up Anzeige: kurze Fanfare-Animation mit neuem Titel

#### Achievements (Badges)

| Badge | Bedingung |
|-------|-----------|
| Erster Schritt | Erste Frage richtig beantwortet |
| Wochenkämpfer | 7-Tage-Streak |
| Unaufhaltbar | 30-Tage-Streak |
| Combo King | 10× Session-Streak |
| Kategorie-Meister | Alle Fragen einer Kategorie richtig |
| Level 5 erreicht | XP-Schwelle überschritten |
| Schnelldenker | 10 Fragen in einer Sitzung richtig |

Badges werden als kleine Icons in einem `achievements[]`-Array im `localStorage` gespeichert.

#### Statistik-Einblendung (per Klick auf Stats-Icon im Widget)

```
Heute:      🔥 7  Streak  |  ✓ 12  Richtig  |  ✗ 3  Falsch  |  ⚡ 8× Bestcombo
Gesamt:     Level 4  Senior Dev  |  1.240 XP  |  Ø 81% korrekt
Kategorien: Webentwicklung ██████░░ 75%  |  Code ████░░░░ 52%  |  KI ████████ 90%
```

---

### localStorage-Datenmodell (Quiz)

```js
// quiz_state
{
  xp: 1240,
  level: 4,
  currentStreak: 7,
  longestStreak: 14,
  lastActiveDate: "2026-04-20",
  bestSessionStreak: 12,
  history: [
    { id: 42, correct: true, date: "2026-04-20", category: "KI", level: 2 },
    // ...
  ],
  achievements: ["first_correct", "week_warrior", "combo_king"],
  activeFilter: { kategorie: "Alle", level: "Alle" }
}
```

---

## Phase 4 – Erweiterungen (optional)

### Code-Snippet-Box

**Datenmodell:**
```js
{ id, title, code, language, tags, createdAt }
```

**Features:**
- Code-Eingabe mit `<textarea>` + Syntax-Highlighting via `highlight.js` (nur 1 Sprache laden)
- Klick auf Snippet → in Zwischenablage kopieren
- Kategorien: Git | CSS | JS | Terminal | Sonstiges

### Settings-Panel

Schiebemenü von rechts:
- Wetter-Standort anpassen
- Suchmaschine wählen
- Favoriten verwalten
- Quiz-Kategorie-Standard setzen
- Light/Dark Mode Toggle (falls gewünscht)

---

## Technische Entscheidungen

| Thema | Entscheidung | Begründung |
|-------|-------------|------------|
| Framework | Vanilla JS (ES Modules) | Kein Build-Step, GitHub Pages direkt |
| CSS | Custom Properties + Grid/Flexbox | Kein Framework-Overhead |
| Icons | Lucide SVG Sprite | Konsistentes Design, offline-fähig |
| Daten lokal | `localStorage` | Einfach, kein Backend nötig |
| API-Key Schutz | Keys in `config.js`, `.gitignore` | Kein Server-Side Proxy nötig bei Open-Meteo |
| Wetter-API | Open-Meteo | Kostenlos, kein Key, CORS-frei |
| News-API | RSS + rss2json.com | Kostenlos, einfach, diverse Quellen |
| Fonts | Google Fonts (Inter, preconnect) | Einziger externer Font-Request |
| Quiz-Daten | Lokale JSON-Datei | Kein API-Call, sofort verfügbar |

---

## Implementierungs-Reihenfolge

```
Tag 1:  Design System + CSS-Variablen + Grid-Layout (neues 3×3-Schema) + Header
Tag 2:  Wetter-Widget (Open-Meteo API + Icons + Caching)
Tag 3:  Favoriten-Leiste (Icon-Bar, Hover-Tooltip, Edit-Modus)
Tag 4:  News-Widgets (RSS-Fetch + Caching + Fehlerbehandlung)
Tag 5:  Quiz-Widget Kern (Queue-Logik, Filter, Antwort-Ablauf, Auto-Next)
Tag 6:  Quiz Gamification (XP, Streak, Level, Achievements, Stats-Panel)
Tag 7:  Pomodoro-Timer (unten links)
Tag 8:  Bookmarks + To-do (unten rechts)
Tag 9:  Feinschliff (Animationen, Responsive, Accessibility), GitHub Pages Deploy
```

---

## GitHub Pages Deployment

1. Repository `mainpage` auf GitHub (public oder private mit Pages-Plan)
2. Settings → Pages → Branch `main` / root `/`
3. URL: `https://yannickschawaller.github.io/mainpage/`
4. Als Browser-Startseite eintragen
5. Update-Workflow: Änderung lokal → `git add . && git commit -m "..." && git push` → automatisch live

**Wichtig:** `config.js` mit API-Keys in `.gitignore` eintragen und lokal vorhalten, oder Open-Meteo nutzen (kein Key nötig).

---

## Offene Fragen / Entscheidungen

- [ ] Welche Städte/Koordinaten für das Wetter?
      Frankfurt am Main, Deutschland
- [ ] Welche konkreten Favoriten-Links (und in welcher Reihenfolge in der Leiste)?
      Erstelle eine Datei, in die ich meine Links von links nach rechts eingeben kann
- [ ] Suchmaschine: Google, DuckDuckGo oder Kagi?
      Erstelle einen Dropdown, bei dem ich zwischen diesen 3 Suchmaschienen wählen kann
- [ ] Soll der News-Bereich filterbar/konfigurierbar sein (Phase 1 oder später)?
      spätere Phase
- [ ] Quiz: Soll die Auto-Next-Pause 1,5s bleiben oder kürzer/länger?
      Soll so bleiben
- [ ] Quiz: Soll es einen „Pause"-Modus geben, der die Queue unterbricht?
      Nein
- [ ] Quiz: Welche XP-Werte und Level-Schwellen fühlen sich motivierend an?
      Es darf gerne herausfordernd sein
- [ ] Soll Phase 4 (Login/Sync) überhaupt umgesetzt werden oder bleibt alles lokal?
      Fürs erste alles Lokal
