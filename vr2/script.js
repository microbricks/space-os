// -----------------------------
// ELEMENTEN
// -----------------------------
const browserApp     = document.querySelector('#browserApp');
const openBrowser    = document.querySelector('#openBrowser');
const browserClose   = document.querySelector('#browserClose');
const browserContent = document.querySelector('#browserContent');
const addressText    = document.querySelector('#addressText');
const keyboard       = document.querySelector('#keyboard');
const cameraRig      = document.querySelector('#cameraRig');
const handCursor     = document.querySelector('#handCursor');
const connectJoyCon  = document.querySelector('#connectJoyCon');

let scrollOffset = 0;

// -----------------------------
// BROWSER OPENEN / SLUITEN
// -----------------------------
openBrowser.addEventListener('click', () => {
  browserApp.setAttribute('visible', true);
  loadPage('https://example.com');
  buildKeyboard();
});

browserClose.addEventListener('click', () => {
  browserApp.setAttribute('visible', false);
});

// -----------------------------
// MINI-BROWSER ENGINE
// -----------------------------
async function loadPage(url) {
  addressText.setAttribute('value', url);
  browserContent.innerHTML = '';
  scrollOffset = 0;

  try {
    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const items = extractContent(doc);
    renderContent(items);
  } catch (e) {
    showError('Kan pagina niet laden.');
  }
}

function extractContent(doc) {
  const items = [];

  doc.body.querySelectorAll('*').forEach(el => {
    if (el.tagName === 'IMG' && el.src) {
      items.push({ type: 'image', src: el.src });
    } else if (el.tagName === 'A' && el.href) {
      items.push({ type: 'link', text: el.innerText || el.href, href: el.href });
    } else if (el.innerText && el.innerText.trim().length > 0) {
      items.push({ type: 'text', text: el.innerText });
    }
  });

  return items.slice(0, 120);
}

function renderContent(items) {
  let y = 0;

  items.forEach(item => {
    if (item.type === 'text') {
      const t = document.createElement('a-text');
      t.setAttribute('value', item.text);
      t.setAttribute('wrap-count', 50);
      t.setAttribute('position', `-1 ${y} 0`);
      browserContent.appendChild(t);
      y -= 0.15;
    }

    if (item.type === 'link') {
      const btn = document.createElement('a-plane');
      btn.setAttribute('width', '2');
      btn.setAttribute('height', '0.15');
      btn.setAttribute('color', '#2a6df4');
      btn.setAttribute('position', `0 ${y} 0`);
      btn.setAttribute('class', 'clickable');

      const txt = document.createElement('a-text');
      txt.setAttribute('value', item.text);
      txt.setAttribute('position', '-0.95 0 0.01');
      txt.setAttribute('wrap-count', 60);

      btn.appendChild(txt);
      browserContent.appendChild(btn);

      btn.addEventListener('click', () => loadPage(item.href));

      y -= 0.2;
    }

    if (item.type === 'image') {
      const img = document.createElement('a-image');
      img.setAttribute('src', item.src);
      img.setAttribute('width', '2');
      img.setAttribute('height', '1');
      img.setAttribute('position', `0 ${y} 0`);
      browserContent.appendChild(img);
      y -= 1.2;
    }
  });
}

function showError(msg) {
  const t = document.createElement('a-text');
  t.setAttribute('value', msg);
  t.setAttribute('color', 'red');
  t.setAttribute('position', '-1 0 0');
  browserContent.appendChild(t);
}

// -----------------------------
// SCROLL MET KIJKRICHTING
// -----------------------------
cameraRig.addEventListener('componentchanged', e => {
  if (e.detail.name !== 'rotation') return;

  const pitch = e.detail.newData.x;

  if (pitch < -10) scrollOffset += 0.02;
  if (pitch > 10) scrollOffset -= 0.02;

  browserContent.setAttribute('position', `0 ${scrollOffset} 0.01`);
});

// -----------------------------
// VR-TOETSENBORD
// -----------------------------
function buildKeyboard() {
  keyboard.innerHTML = '';

  const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./';
  let x = -1;
  let y = 0.4;

  keys.split('').forEach(char => {
    addKey(char, x, y);
    x += 0.25;
    if (x > 1) {
      x = -1;
      y -= 0.25;
    }
  });

  addKey('BACK', -0.5, -0.2);
  addKey('ENTER', 0.5, -0.2);
}

function addKey(label, x, y) {
  const key = document.createElement('a-plane');
  key.setAttribute('width', '0.22');
  key.setAttribute('height', '0.22');
  key.setAttribute('color', '#444');
  key.setAttribute('position', `${x} ${y} 0`);
  key.setAttribute('class', 'clickable');

  const txt = document.createElement('a-text');
  txt.setAttribute('value', label);
  txt.setAttribute('align', 'center');
  txt.setAttribute('position', '-0.07 0 0.01');

  key.appendChild(txt);
  keyboard.appendChild(key);

  key.addEventListener('click', () => pressKey(label));
}

function pressKey(label) {
  let current = addressText.getAttribute('value');

  if (label === 'BACK') {
    current = current.slice(0, -1);
  } else if (label === 'ENTER') {
    loadPage(current);
    return;
  } else {
    current += label.toLowerCase();
  }

  addressText.setAttribute('value', current);
}

// -----------------------------
// JOY-CONS VIA GAMEPAD API
// -----------------------------
let useGamepad = false;
let lastAPressed = false;

function connectJoyConHandler() {
  if (!('getGamepads' in navigator)) {
    alert('Gamepad API wordt niet ondersteund in deze browser.');
    return;
  }

  useGamepad = true;
  alert('Koppel nu je Joy-Con via Bluetooth aan je telefoon.\nDaarna werkt de stick + A-knop.');
}

connectJoyCon.addEventListener('click', connectJoyConHandler);

// Polling loop
function gamepadLoop() {
  if (useGamepad) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads[0];

    if (pad) {
      // Meestal: axes[0] = X, axes[1] = Y van linker stick
      let ax = 0;
let ay = 0;

// 1. Probeer echte stick (axes)
if (pad.axes && pad.axes.length >= 2) {
  ax = pad.axes[0];
  ay = pad.axes[1];
}

// 2. Als stick NIET werkt → gebruik D-pad knoppen
// Joy-Con D-pad knoppen (meestal):
// button 12 = up
// button 13 = down
// button 14 = left
// button 15 = right

if (pad.buttons[12]?.pressed) ay = -1;
if (pad.buttons[13]?.pressed) ay = +1;
if (pad.buttons[14]?.pressed) ax = -1;
if (pad.buttons[15]?.pressed) ax = +1;

// Normaliseer naar 0..1
const nx = (ax + 1) / 2;
const ny = (ay + 1) / 2;

updateJoyConCursor(nx, ny);


      // ax/ay zijn tussen -1 en 1
      const nx = (ax + 1) / 2;      // 0..1
      const ny = (ay + 1) / 2;      // 0..1

      updateJoyConCursor(nx, ny);

      // Meestal: button 0 = A / hoofdknop
      const aPressed = pad.buttons[0] && pad.buttons[0].pressed;

      if (aPressed && !lastAPressed) {
        joyConClick();
      }
      lastAPressed = aPressed;
    }
  }

  requestAnimationFrame(gamepadLoop);
}

gamepadLoop();

function updateJoyConCursor(nx, ny) {
  const x = (nx - 0.5) * 2.0;
  const y = 1.6 - ny * 0.8;
  handCursor.setAttribute('position', `${x} ${y} -2.5`);
}

// -----------------------------
// JOY-CON CLICK → RAYCAST CLICK
// -----------------------------
function joyConClick() {
  const cursorPos = handCursor.object3D.position.clone();
  const dir = new THREE.Vector3(0, 0, -1);
  handCursor.object3D.getWorldDirection(dir);

  const raycaster = new THREE.Raycaster(cursorPos, dir.normalize());
  const clickableEls = Array.from(document.querySelectorAll('.clickable'))
    .map(el => el.object3D);

  const intersects = raycaster.intersectObjects(clickableEls, true);

  if (intersects.length > 0) {
    const hitObj = intersects[0].object;
    let targetEl = hitObj.el;

    while (targetEl && !targetEl.tagName) {
      targetEl = targetEl.parentEl;
    }

    if (targetEl) {
      targetEl.emit('click');
    }
  }
}
