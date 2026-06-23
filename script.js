// Elementen
const notesApp     = document.querySelector('#notesApp');
const browserApp   = document.querySelector('#browserApp');
const spotifyApp   = document.querySelector('#spotifyApp');

const openNotes    = document.querySelector('#openNotes');
const openBrowser  = document.querySelector('#openBrowser');
const openSpotify  = document.querySelector('#openSpotify');

const notesClose   = document.querySelector('#notesClose');
const browserClose = document.querySelector('#browserClose');
const spotifyClose = document.querySelector('#spotifyClose');

const notesText    = document.querySelector('#notesText');

// Notities openen
openNotes.addEventListener('click', () => {
  notesApp.setAttribute('visible', true);
});

// VR-mini-browser openen
openBrowser.addEventListener('click', () => {
  browserApp.setAttribute('visible', true);
  loadPage('https://example.com');
});

// Spotify openen (placeholder)
openSpotify.addEventListener('click', () => {
  spotifyApp.setAttribute('visible', true);
});

// Sluiten
notesClose.addEventListener('click', () => {
  notesApp.setAttribute('visible', false);
});

browserClose.addEventListener('click', () => {
  browserApp.setAttribute('visible', false);
});

spotifyClose.addEventListener('click', () => {
  spotifyApp.setAttribute('visible', false);
});

// Notities‑app: tekst invoeren + opslaan
notesApp.addEventListener('click', () => {
  const text = prompt('Typ je notitie:');
  if (text) {
    notesText.setAttribute('value', text);
    try {
      localStorage.setItem('vrNotes', text);
    } catch (e) {
      console.warn('Kon notities niet opslaan:', e);
    }
  }
});

// Notities laden bij start
try {
  const saved = localStorage.getItem('vrNotes');
  if (saved) {
    notesText.setAttribute('value', saved);
  }
} catch (e) {
  console.warn('Kon opgeslagen notities niet laden:', e);
}

// Mini-browser engine
async function loadPage(url) {
  const content = document.querySelector('#browserContent');
  const addressText = document.querySelector('#addressText');

  addressText.setAttribute('value', url);
  content.innerHTML = '';

  try {
    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const text = doc.body.innerText.substring(0, 2000);

    const textEntity = document.createElement('a-text');
    textEntity.setAttribute('value', text);
    textEntity.setAttribute('wrap-count', 50);
    textEntity.setAttribute('position', '-0.9 0 0');
    content.appendChild(textEntity);
  } catch (e) {
    const errorText = document.createElement('a-text');
    errorText.setAttribute('value', 'Kan pagina niet laden.');
    errorText.setAttribute('color', 'red');
    errorText.setAttribute('position', '-0.9 0 0');
    content.appendChild(errorText);
  }
}
