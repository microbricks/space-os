const camVideo = document.getElementById("camVideo");
const cameraBtn = document.getElementById("cameraBtn");
const sceneEl = document.getElementById("scene");
const melding = document.getElementById("melding");

// SpaceOS melding functie
function showMelding(text) {
  melding.textContent = text;
  melding.style.display = "block";

  setTimeout(() => {
    melding.style.display = "none";
  }, 3000);
}

// Renderer transparant maken
sceneEl.addEventListener("loaded", () => {
  const renderer = sceneEl.renderer;
  if (renderer) {
    renderer.setClearColor(0x000000, 0);
  }
});

// Toestemming checken
async function vraagCameraToestemming() {
  if (!navigator.permissions) {
    showMelding("Kan permissies niet controleren, proberen...");
    return true;
  }

  try {
    const status = await navigator.permissions.query({ name: "camera" });

    if (status.state === "granted") {
      showMelding("✔ Camera toegestaan");
      return true;
    }

    if (status.state === "prompt") {
      showMelding("ℹ Toestemming wordt gevraagd...");
      return true;
    }

    if (status.state === "denied") {
      showMelding("❌ Camera geblokkeerd in instellingen");
      return false;
    }

  } catch (err) {
    showMelding("⚠ Kan permissie niet controleren");
    return true;
  }
}

// Camera starten
cameraBtn.addEventListener("click", async () => {
  const toestemming = await vraagCameraToestemming();
  if (!toestemming) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    camVideo.srcObject = stream;
    camVideo.style.display = "block";

    showMelding("🎥 Camera achtergrond actief");

  } catch (err) {
    showMelding("❌ Camera fout: " + err.message);
  }
});
