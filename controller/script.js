let pc, channel;
let offerText = "";

async function startConnection() {
  pc = new RTCPeerConnection();
  channel = pc.createDataChannel("hand");

  channel.onopen = () => {
    document.getElementById("status").textContent = "Verbonden";
  };

  pc.onicecandidate = e => {
    if (!e.candidate) {
      offerText = btoa(JSON.stringify(pc.localDescription));
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
}

async function applyAnswer(answerStr) {
  const desc = JSON.parse(atob(answerStr));
  await pc.setRemoteDescription(desc);
}

document.getElementById("start").onclick = () => {
  startConnection();
  document.getElementById("status").textContent = "Offer maken...";
};

document.getElementById("copyOffer").onclick = async () => {
  if (!offerText) return alert("Nog geen offer klaar");
  await navigator.clipboard.writeText(offerText);
  alert("Offer gekopieerd. Plak dit in SpaceOS.");
};

document.getElementById("pasteAnswer").onclick = async () => {
  const txt = prompt("Plak hier de answer van SpaceOS:");
  if (!txt) return;
  await applyAnswer(txt.trim());
  document.getElementById("status").textContent = "Answer toegepast...";
};

const pad = document.getElementById("pad");
let rect;

function sendPos(ev) {
  if (!channel || channel.readyState !== "open") return;
  if (!rect) rect = pad.getBoundingClientRect();

  const t = ev.touches ? ev.touches[0] : ev;
  const x = (t.clientX - rect.left) / rect.width;
  const y = (t.clientY - rect.top) / rect.height;

  channel.send(JSON.stringify({ type:"move", x, y }));
}

pad.addEventListener("touchstart", sendPos);
pad.addEventListener("touchmove", sendPos);
pad.addEventListener("mousemove", e => {
  if (e.buttons) sendPos(e);
});

pad.addEventListener("touchend", () => {
  if (!channel || channel.readyState !== "open") return;
  channel.send(JSON.stringify({ type:"click" }));
});
