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
const browserContent = document.querySelector('#browserContent');
const addressText = document.querySelector('#addressText');

let scrollOffset = 0;

// Notities openen
openNotes.addEventListener('click', () => {
  notesApp.setAttribute('visible', true);
});

// Browser openen
openBrowser.addEventListener('click', () => {
  browserApp.setAttribute('visible', true);
  loadPage("https://example.com");
});

// Spotify openen
openSpotify.addEventListener('click', () => {
  spotifyApp.setAttribute('visible', true);
});

// Sluiten
notesClose.addEventListener('click', () => notesApp.setAttribute('visible', false));
browserClose.addEventListener('click', () => browserApp.setAttribute('visible', false));
spotifyClose.addEventListener('click', () => spotifyApp.setAttribute('visible', false));

// Notities opslaan
notesApp.addEventListener('click', () => {
  const text = prompt('Typ je notitie:');
  if (text) {
    notesText.setAttribute('value', text);
    localStorage.setItem('vrNotes', text);
  }
});

// Notities laden
const saved = localStorage.getItem('vrNotes');
if (saved) notesText.setAttribute('value', saved);


// -----------------------------
// MINI-BROWSER ENGINE
// -----------------------------

async function loadPage(url) {
  addressText.setAttribute('value', url);
  browserContent.innerHTML = "";
  scrollOffset = 0;

  try {
    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const items = extractContent(doc);
    renderContent(items);

  } catch (e) {
    showError("Kan pagina niet laden.");
  }
}

// HTML parser → tekst + links + afbeeldingen
function extractContent(doc) {
  const items = [];

  doc.body.querySelectorAll("*").forEach(el => {

    // Afbeeldingen
    if (el.tagName === "IMG" && el.src) {
      items.push({ type: "image", src: el.src });
    }

    // Links
    else if (el.tagName === "A" && el.href) {
      items.push({ type: "link", text: el.innerText || el.href, href: el.href });
    }

    // Tekst
    else if (el.innerText && el.innerText.trim().length > 0) {
      items.push({ type: "text", text: el.innerText });
    }
  });

  return items.slice(0, 120); // performance limit
}

// VR-renderer
function renderContent(items) {
  let y = 0;

  items.forEach(item => {

    // Tekst
    if (item.type === "text") {
      const t = document.createElement("a-text");
      t.setAttribute("value", item.text);
      t.setAttribute("wrap-count", 50);
      t.setAttribute("position", `-0.9 ${y} 0`);
      browserContent.appendChild(t);
      y -= 0.15;
    }

    // Klikbare link
    if (item.type === "link") {
      const btn = document.createElement("a-plane");
      btn.setAttribute("width", "1.8");
      btn.setAttribute("height", "0.15");
      btn.setAttribute("color", "#2a6df4");
      btn.setAttribute("position", `0 ${y} 0`);
      btn.setAttribute("class", "clickable");

      const txt = document.createElement("a-text");
      txt.setAttribute("value", item.text);
      txt.setAttribute("position", "-0.85 0 0.01");
      txt.setAttribute("wrap-count", 40);

      btn.appendChild(txt);
      browserContent.appendChild(btn);

      btn.addEventListener("click", () => loadPage(item.href));

      y -= 0.2;
    }

    // Afbeelding
    if (item.type === "image") {
      const img = document.createElement("a-image");
      img.setAttribute("src", item.src);
      img.setAttribute("width", "1.8");
      img.setAttribute("height", "1");
      img.setAttribute("position", `0 ${y} 0`);
      browserContent.appendChild(img);

      y -= 1.2;
    }
  });
}

// Foutmelding
function showError(msg) {
  const t = document.createElement("a-text");
  t.setAttribute("value", msg);
  t.setAttribute("color", "red");
  t.setAttribute("position", "-0.9 0 0");
  browserContent.appendChild(t);
}


// -----------------------------
// SCROLL SYSTEM
// -----------------------------

document.querySelector('#cameraRig').addEventListener("componentchanged", e => {
  if (e.detail.name !== "rotation") return;

  const pitch = e.detail.newData.x;

  if (pitch < -10) scrollOffset += 0.02;   // omhoog kijken → scroll omhoog
  if (pitch > 10) scrollOffset -= 0.02;    // omlaag kijken → scroll omlaag

  browserContent.setAttribute("position", `0 ${scrollOffset} 0.01`);
});
