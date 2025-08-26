import * as THREE from "three";
const controller: Record<
  KeyboardEvent["key"],
  {
    pressed: boolean;
  }
> = {};
setUpKeyControls();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});
const cube = new THREE.Mesh(geometry, material);
cube.name = "cube"; // Set a name for the cube to access it later
scene.add(cube);

camera.position.z = 5;

let lastTimestamp = performance.now();
animate();

function animate() {
  const timestamp = requestAnimationFrame(animate);
  const delta = (timestamp - lastTimestamp) / 1000; // Convert to seconds
  handleController(delta);
  lastTimestamp = timestamp;
  renderer.render(scene, camera);
}
function handleController(delta: number) {
  var player = scene.getObjectByName("cube") as THREE.Mesh;
  // Handle key controls
  const speed = 50;
  if (controller["ArrowUp"]?.pressed) {
    player.rotation.y += speed * delta;
  }
  if (controller["ArrowDown"]?.pressed) {
    player.rotation.y -= speed * delta;
  }
  if (controller["ArrowLeft"]?.pressed) {
    player.rotation.x -= speed * delta;
  }
  if (controller["ArrowRight"]?.pressed) {
    player.rotation.x += speed * delta;
  }

  if (controller["w"]?.pressed) {
    player.scale.y += speed * delta;
    player.scale.y = clamp(player.scale.y, 0, 10);
  }
  if (controller["s"]?.pressed) {
    player.scale.y -= speed * delta;
    player.scale.y = clamp(player.scale.y, 0, 10);
  }
  if (controller["a"]?.pressed) {
    player.scale.x -= speed * delta;
    player.scale.x = clamp(player.scale.x, 0, 10);
  }
  if (controller["d"]?.pressed) {
    player.scale.x += speed * delta;
    player.scale.x = clamp(player.scale.x, 0, 10);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function setUpKeyControls() {
  document.addEventListener("keydown", (event) => {
    controller[event.key] = { pressed: true };
  });
  document.addEventListener("keyup", (event) => {
    controller[event.key] = { pressed: false };
  });
}
