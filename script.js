// Elementen ophalen
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

// Apps openen via dock
openNotes.addEventListener('click', () => {
  notesApp.setAttribute('visible', true);
});

openBrowser.addEventListener('click', () => {
  browserApp.setAttribute('visible', true);
  window.open('https://google.com', '_blank'); // echte browser
});

openSpotify.addEventListener('click', () => {
  spotifyApp.setAttribute('visible', true);
});

// Apps sluiten
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
