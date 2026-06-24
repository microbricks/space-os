// ELEMENTS
const handCursor = document.querySelector('#handCursor');
const cameraRig  = document.querySelector('#cameraRig');

// Apps
const openBrowser = document.querySelector('#openBrowser');
const browserApp  = document.querySelector('#browserApp');
const browserClose = document.querySelector('#browserClose');

const openClock = document.querySelector('#openClock');
const clockApp  = document.querySelector('#clockApp');
const clockText = document.querySelector('#clockText');
const clockClose = document.querySelector('#clockClose');

const openNotes = document.querySelector('#openNotes');
const notesApp  = document.querySelector('#notesApp');
const notesText = document.querySelector('#notesText');
const notesAdd  = document.querySelector('#notesAdd');
const notesClose = document.querySelector('#notesClose');

// DOT PULSE
let pulseTimer = null;
function pulseCursor() {
  handCursor.setAttribute('radius', 0.06);
  clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => {
    handCursor.setAttribute('radius', 0.03);
  }, 150);
}

// APP OPEN/CLOSE
openBrowser.addEventListener('click', () => {
  browserApp.setAttribute('visible', true);
  pulseCursor();
});
browserClose.addEventListener('click', () => {
  browserApp.setAttribute('visible', false);
  pulseCursor();
});

openClock.addEventListener('click', () => {
  clockApp.setAttribute('visible', true);
  pulseCursor();
});
clockClose.addEventListener('click', () => {
  clockApp.setAttribute('visible', false);
  pulseCursor();
});

openNotes.addEventListener('click', () => {
  notesApp.setAttribute('visible', true);
  pulseCursor();
});
notesClose.addEventListener('click', () => {
  notesApp.setAttribute('visible', false);
  pulseCursor();
});
notesAdd.addEventListener('click', () => {
  notesText.setAttribute('value', notesText.getAttribute('value') + "\n- Nieuwe notitie");
  pulseCursor();
});

// CLOCK UPDATE
setInterval(() => {
  const now = new Date();
  clockText.setAttribute('value', now.toTimeString().split(' ')[0]);
}, 500);

// GAZE CLICK (100% werkend)
let gazeTarget = null;
let gazeStart = 0;
const gazeTime = 1000;

function updateGaze() {
  const origin = new THREE.Vector3();
  handCursor.object3D.getWorldPosition(origin);

  const direction = new THREE.Vector3(0, 0, -1);
  handCursor.object3D.getWorldDirection(direction);

  const raycaster = new THREE.Raycaster(origin, direction.normalize());

  const clickableEls = Array.from(document.querySelectorAll('.clickable'));

  const meshes = clickableEls.map(el => el.object3D);

  const hits = raycaster.intersectObjects(meshes, true);

  if (hits.length > 0) {
    let obj = hits[0].object;
    while (obj && !obj.el) obj = obj.parent;
    const el = obj?.el;

    if (!el) {
      gazeTarget = null;
      return requestAnimationFrame(updateGaze);
    }

    if (el !== gazeTarget) {
      gazeTarget = el;
      gazeStart = performance.now();
    }

    if (performance.now() - gazeStart > gazeTime) {
      el.emit('click');
      pulseCursor();
      gazeStart = performance.now() + 999999;
    }

  } else {
    gazeTarget = null;
  }

  requestAnimationFrame(updateGaze);
}

updateGaze();
