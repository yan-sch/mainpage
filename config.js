// Standort für Wetter-Widget
export const weather = {
  latitude: 50.1109,
  longitude: 8.6821,
  city: 'Frankfurt am Main',
};

// Suchmaschinen
export const searchEngines = {
  google:     'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  kagi:       'https://kagi.com/search?q=',
};

// Favoriten – von links nach rechts eintragen
// Felder: label (Tooltip-Name), url (vollständige URL)
export const defaultFavorites = [
  { label: 'Mail',     url: 'https://mail.google.com' },
  { label: 'GitHub',   url: 'https://github.com' },
  { label: 'ChatGPT',  url: 'https://chat.openai.com' },
  { label: 'YouTube',  url: 'https://youtube.com' },
  { label: 'Reddit',   url: 'https://reddit.com' },
  { label: 'LinkedIn', url: 'https://linkedin.com' },
];
