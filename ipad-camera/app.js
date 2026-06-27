const video = document.getElementById('cam');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
const debug = document.getElementById('debug');

// Start camera
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' }, // 'environment' als je achtercamera wilt
    audio: false
  });
  video.srcObject = stream;
}

startCamera();

// MediaPipe Hands setup
const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

hands.onResults(onResults);

// Camera helper
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});
camera.start();

// Process results
function onResults(results) {
  // Canvas size sync
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw camera frame
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  // Draw hands
  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const landmarks = results.multiHandLandmarks[i];
      const handedness = results.multiHandedness[i].label; // 'Left' / 'Right'

      drawConnectors(ctx, landmarks, HAND_CONNECTIONS,
        { color: handedness === 'Left' ? '#00ff88' : '#ff0088', lineWidth: 3 });
      drawLandmarks(ctx, landmarks,
        { color: '#ffffff', lineWidth: 1 });
    }
  }

  ctx.restore();

  // Build JSON for SpaceOS
  const payload = buildPayload(results);
  debug.textContent = JSON.stringify(payload, null, 2);

  // TODO: hier straks via WebRTC versturen
  // sendToSpaceOS(payload);
}

// Maak een simpele payload met handposities + basic gesture
function buildPayload(results) {
  const handsOut = [];

  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const landmarks = results.multiHandLandmarks[i];
      const handedness = results.multiHandedness[i].label; // 'Left' / 'Right'

      // Normalized coords (0–1)
      const points = landmarks.map(lm => ({
        x: lm.x,
        y: lm.y,
        z: lm.z
      }));

      // Heel simpele gesture: pinch (duim + wijsvinger dicht bij elkaar)
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let gesture = 'open';
      if (dist < 0.05) gesture = 'pinch';

      handsOut.push({
        hand: handedness.toLowerCase(),
        landmarks: points,
        gesture
      });
    }
  }

  return {
    type: 'hands',
    hands: handsOut,
    timestamp: Date.now()
  };
}
