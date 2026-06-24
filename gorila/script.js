const cameraRig = document.querySelector('#cameraRig');
const leftHand  = document.querySelector('#leftHand');
const rightHand = document.querySelector('#rightHand');

let velocityY = 0;
const gravity = -0.01;
let isGrounded = true;

// vorige handposities
let prevLeftY  = null;
let prevRightY = null;

// snelheid
const forwardSpeed = 0.05;

// main loop
function update() {
  const headPos  = new THREE.Vector3();
  const leftPos  = new THREE.Vector3();
  const rightPos = new THREE.Vector3();

  cameraRig.object3D.getWorldPosition(headPos);
  leftHand.object3D.getWorldPosition(leftPos);
  rightHand.object3D.getWorldPosition(rightPos);

  if (prevLeftY === null) {
    prevLeftY  = leftPos.y;
    prevRightY = rightPos.y;
  }

  const leftDeltaY  = leftPos.y  - prevLeftY;
  const rightDeltaY = rightPos.y - prevRightY;

  // handen omlaag bewegen = vooruit
  const swingThreshold = -0.02;
  if (leftDeltaY < swingThreshold || rightDeltaY < swingThreshold) {
    const dir = new THREE.Vector3(0, 0, -1);
    cameraRig.object3D.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    dir.multiplyScalar(forwardSpeed);
    cameraRig.object3D.position.add(dir);
  }

  prevLeftY  = leftPos.y;
  prevRightY = rightPos.y;

  // gravity
  if (!isGrounded) {
    velocityY += gravity;
    cameraRig.object3D.position.y += velocityY;
  }

  // ground check
  if (cameraRig.object3D.position.y <= 1.6) {
    cameraRig.object3D.position.y = 1.6;
    velocityY = 0;
    isGrounded = true;
  }

  requestAnimationFrame(update);
}

update();

// jump
document.addEventListener('click', () => {
  if (isGrounded) {
    velocityY = 0.18;
    isGrounded = false;
  }
});
