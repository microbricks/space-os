const camVideo = document.getElementById("camVideo");
const cameraBtn = document.getElementById("cameraBtn");
const sceneEl = document.getElementById("scene");

// Renderer transparant maken zodra A-Frame klaar is
sceneEl.addEventListener("loaded", () => {
  const renderer = sceneEl.renderer;
  if (renderer) {
    renderer.setClearColor(0x000000, 0);
  }
});

// 🔵 Toestemming checken + melding tonen
async function vraagCameraToestemming() {
  if (!navigator.permissions) {
    console.warn("Permissions API niet beschikbaar");
    return true;
  }

  try {
    const status = await navigator.permissions.query({ name: "camera" });

    console.log("Camera permissie status:", status.state);

    if (status.state === "granted") {
      alert("✔ Camera toegestaan — je kunt nu de achtergrond gebruiken.");
      return true;
    }

    if (status.state === "prompt") {
      alert("ℹ Je krijgt nu een pop-up om camera-toestemming te geven.");
      return true;
    }

    if (status.state === "denied") {
      alert(
        "❌ Je telefoon blokkeert de camera.\n\n" +
        "Ga naar:\nInstellingen → Apps → Chrome → Machtigingen → Camera → Toestaan"
      );
      return false;
    }

  } catch (err) {
    console.warn("Kon permissie niet checken:", err);
    return true;
  }
}

// 🔵 Camera starten
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

    alert("🎥 Camera achtergrond is nu actief!");
    console.log("Camera achtergrond actief");

  } catch (err) {
    console.error("Camera fout:", err);
    alert("Kon camera niet openen: " + err.message);
  }
});
