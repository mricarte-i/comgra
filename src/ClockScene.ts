import * as THREE from "three";
import "./controls.css";

//
const controller: Record<
  KeyboardEvent["key"],
  {
    pressed: boolean;
  }
> = {};
function setUpKeyControls() {
  document.addEventListener("keydown", (event) => {
    let key = event.key;
    if (event.key.length === 1) {
      key = event.key.toLowerCase();
    }
    controller[key] = { pressed: true };
  });
  document.addEventListener("keyup", (event) => {
    let key = event.key;
    if (event.key.length === 1) {
      key = event.key.toLowerCase();
    }
    controller[key] = { pressed: false };
  });
}
setUpKeyControls();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
//renderer.autoClearDepth = false;
//renderer.autoClearColor = false;
renderer.setClearColor(0x000000, 1); // Set background color to black
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

camera.position.z = 5;
camera.name = "camera"; // Set a name for the camera to access it later

const light = new THREE.AmbientLight(0xffffff, 1); // Soft white light
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xff00ee, 0.1);
directionalLight.position.set(0, 0, 2);
directionalLight.rotation.x = Math.PI / 2;
directionalLight.name = "directionalLight";
scene.add(directionalLight);

const grid = new THREE.GridHelper(10, 10);
grid.name = "grid"; // Set a name for the grid to access it later
scene.add(grid);

const axis = new THREE.AxesHelper(10);
axis.name = "axis"; // Set a name for the axis to access it later
scene.add(axis);

// scene setup

createPoint("penduloPivot", new THREE.Vector3(0, 0, 0));
createBox("pendulo", 0.2, 4, 1, 0x00ff00, true);

createPoint("horasPivot", new THREE.Vector3(0, 0, 0));
createBox("horas", 0.1, 0.3, 1, 0xff0000);

createPoint("minutosPivot", new THREE.Vector3(0, 0, 0));
createBox("minutos", 0.05, 0.4, 1, 0x0000ff);

createPoint("segundosPivot", new THREE.Vector3(0, 0, 0));
createBox("segundos", 0.02, 0.1, 1, 0xffff00);

createPoint("principalCenter", new THREE.Vector3(0, 0, 0));
createCylinder("principal", 0.5, 0.5, 1, 0xcdcdcd);
createPoint("segunderoCenter", new THREE.Vector3(0, 0, 0));
createCylinder("segundero", 0.25 / 2, 0.25 / 2, 1, 0xababab);

var ppal = scene.getObjectByName("principal") as THREE.Mesh;
ppal.rotation.x = Math.PI / 2; // Rotate to align with the pendulum
var segero = scene.getObjectByName("segundero") as THREE.Mesh;
segero.rotation.x = Math.PI / 2; // Rotate to align with the pendulum
//ppal.add(segero);

var principalCenter = scene.getObjectByName("principalCenter") as THREE.Mesh;

var horasPivot = scene.getObjectByName("horasPivot") as THREE.Mesh;
var horas = scene.getObjectByName("horas") as THREE.Mesh;
horas.position.set(0, 0.15, 0.15);
horasPivot.add(horas);
principalCenter.add(horasPivot);

var minutosPivot = scene.getObjectByName("minutosPivot") as THREE.Mesh;
var minutos = scene.getObjectByName("minutos") as THREE.Mesh;
minutos.position.set(0, 0.2, 0.15);
minutosPivot.add(minutos);
principalCenter.add(minutosPivot);

var segunderoCenter = scene.getObjectByName("segunderoCenter") as THREE.Mesh;
var segundosPivot = scene.getObjectByName("segundosPivot") as THREE.Mesh;
var segundos = scene.getObjectByName("segundos") as THREE.Mesh;
segundos.position.set(0, 0.05, 0.05);
segundosPivot.add(segundos);
segunderoCenter.add(segundosPivot);
segunderoCenter.add(segero);
segunderoCenter.position.set(0, -0.25, 0.05);

principalCenter.add(ppal);
principalCenter.add(segunderoCenter);

principalCenter.position.set(0, -2, -0.5);
var pend = scene.getObjectByName("pendulo") as THREE.Mesh;
pend.add(principalCenter);
var penduloPivot = scene.getObjectByName("penduloPivot") as THREE.Mesh;
pend.position.set(0, -2, 0.5);
penduloPivot.add(pend);

penduloPivot.position.set(0, 4, 0);

// update loop

let lastTimestamp = performance.now();
animate();

function animate() {
  //const timestamp = requestAnimationFrame(animate);
  const timestamp = performance.now();
  const delta = (timestamp - lastTimestamp) / 1000; // Convert to seconds
  update(delta);
  handleCameraController(delta);
  lastTimestamp = timestamp;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

var follow = false;
var clearBuffer = false;
function update(_delta: number) {
  const timestamp = new Date().getTime();
  const dirLight = scene.getObjectByName(
    "directionalLight"
  ) as THREE.DirectionalLight;
  dirLight.color.setHSL((timestamp / 10000) % 1, 0.5, 0.5);
  dirLight.rotation.y += THREE.MathUtils.degToRad(15 * _delta);
  dirLight.intensity = 0.5 + 0.5 * Math.sin((timestamp / 1000) % (2 * Math.PI));

  const pendAngle = 15 * Math.cos((180 * timestamp) / 60000); // Oscillate between -15 and 15 degrees
  /*
  rotateAboutPoint(
    pend,
    new THREE.Vector3(0, 2, 0.5),
    new THREE.Vector3(0, 0, 1),
    pendAngle
  );
  */
  var penduloPivot = scene.getObjectByName("penduloPivot") as THREE.Mesh;
  penduloPivot.rotation.z = THREE.MathUtils.degToRad(pendAngle);

  var principalCenter = scene.getObjectByName("principalCenter") as THREE.Mesh;
  principalCenter.rotation.z = THREE.MathUtils.degToRad(-pendAngle);

  var segundosPivot = scene.getObjectByName("segundosPivot") as THREE.Mesh;
  const segAngle = (-360 * timestamp) / 900; // Full rotation every second
  segundosPivot.rotation.z = THREE.MathUtils.degToRad(segAngle);

  var minutosPivot = scene.getObjectByName("minutosPivot") as THREE.Mesh;
  const minAngle = (-360 * timestamp) / 60000; // Full rotation every minute
  minutosPivot.rotation.z = THREE.MathUtils.degToRad(minAngle);

  var horasPivot = scene.getObjectByName("horasPivot") as THREE.Mesh;
  const hourAngle = (-360 * timestamp) / 3600000; // Full rotation every hour
  horasPivot.rotation.z = THREE.MathUtils.degToRad(hourAngle);

  if (follow) {
    const worldPos = principalCenter.getWorldPosition(new THREE.Vector3());
    camera.position.set(worldPos.x, worldPos.y, worldPos.z + 5);
    camera.lookAt(worldPos);
  }
}

function rotateAboutPoint(
  object: THREE.Object3D,
  point: THREE.Vector3,
  axis: THREE.Vector3, //normalized vector for the axis of rotation
  theta: number, //radians
  pointIsWorld = false
) {
  if (pointIsWorld) {
    object.parent?.localToWorld(object.position);
  }

  object.position.sub(point);
  object.position.applyAxisAngle(axis, theta);
  object.position.add(point);

  if (pointIsWorld) {
    object.parent?.worldToLocal(object.position);
  }
  object.rotateOnAxis(axis, theta);
}

function createBox(
  name: string,
  width: number = 1,
  height: number = 1,
  depth: number = 1,
  color: number = 0x00ff00,
  wireframe: boolean = false
) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  //const material = new THREE.MeshBasicMaterial({
  const material = new THREE.MeshStandardMaterial({
    color,
    wireframe,
  });
  material.roughness = 0.5;
  material.emissive = new THREE.Color(0xecf542);
  material.emissiveIntensity = 0.5;
  const pendulo = new THREE.Mesh(geometry, material);
  pendulo.name = name; // Set a name for the cube to access it later
  scene.add(pendulo);
}

function createCylinder(
  name: string,
  radiusTop: number = 1,
  radiusBottom: number = 1,
  height: number = 1,
  color: number = 0x00ff00,
  wireframe: boolean = false
) {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height);
  //const material = new THREE.MeshBasicMaterial({
  //  color,
  //  wireframe,
  //});
  const material = new THREE.MeshStandardMaterial({
    color,
    wireframe,
  });
  material.roughness = 0.1;
  material.metalness = 0.5;
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.name = name; // Set a name for the cylinder to access it later
  scene.add(cylinder);
}

function createPoint(name: string, position: THREE.Vector3) {
  const geometry = new THREE.SphereGeometry(0.05);
  //const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const point = new THREE.Mesh(geometry, material);
  point.name = name;
  point.position.copy(position);
  scene.add(point);
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="hovering">
    <p class="read-the-docs">
      Controls: 
      <br/>
      - [W], [A], [S], [D] camera translation
      <br/>
      - [Q], [E] vertical camera translation
      <br/>
      (<p id="positionStatus">x: 0, y: 0, z: 5</p>)
      <br/>
      - Arrow keys camera rotation
      <br/>
      - [Z], [X] zoom in/out (<p id="zoomStatus">75</p>)
      <br/>
      - [F] toggle follow mode (<p id="followStatus">OFF</p>)
      <br/>
      - [C] toggle clear buffer (<p id="clearBufferStatus">ON</p>) 
    </p>
  </div>
`;
function handleCameraController(delta: number) {
  var player = camera as THREE.PerspectiveCamera;
  // Handle key controls

  // Rotation
  const rotSpeed = 1;
  let rotationVector = new THREE.Vector3();
  if (controller["ArrowUp"]?.pressed) {
    rotationVector.x += rotSpeed * delta;
  }
  if (controller["ArrowDown"]?.pressed) {
    rotationVector.x -= rotSpeed * delta;
  }
  if (controller["ArrowLeft"]?.pressed) {
    rotationVector.y += rotSpeed * delta;
  }
  if (controller["ArrowRight"]?.pressed) {
    rotationVector.y -= rotSpeed * delta;
  }
  player.rotation.x += rotationVector.x;
  player.rotation.y += rotationVector.y;
  player.rotation.z += rotationVector.z;

  // Translation
  const speed = 5;
  let movementVector = new THREE.Vector3();
  if (controller["w"]?.pressed) {
    console.log("ayuda");
    movementVector.z -= speed * delta;
  }
  if (controller["s"]?.pressed) {
    movementVector.z += speed * delta;
  }
  if (controller["a"]?.pressed) {
    movementVector.x -= speed * delta;
  }
  if (controller["d"]?.pressed) {
    movementVector.x += speed * delta;
  }
  if (controller["q"]?.pressed) {
    movementVector.y += speed * delta;
  }
  if (controller["e"]?.pressed) {
    movementVector.y -= speed * delta;
  }
  const rotX = new THREE.Matrix4().makeRotationX(player.rotation.x);
  const rotY = new THREE.Matrix4().makeRotationY(player.rotation.y);
  const rotZ = new THREE.Matrix4().makeRotationZ(player.rotation.z);
  const rotationMatrix = new THREE.Matrix4()
    .multiply(rotZ)
    .multiply(rotY)
    .multiply(rotX);
  movementVector.applyMatrix4(rotationMatrix);
  player.position.add(movementVector);
  const positionStatus = document.getElementById("positionStatus");
  if (positionStatus) {
    positionStatus.textContent = `x: ${player.position.x.toFixed(
      2
    )}, y: ${player.position.y.toFixed(2)}, z: ${player.position.z.toFixed(2)}`;
  }

  // Zoom
  if (controller["z"]?.pressed) {
    player.fov = clamp(player.fov - speed, 10, 180);
    const zoomStatus = document.getElementById("zoomStatus");
    if (zoomStatus) {
      zoomStatus.textContent = player.fov.toFixed(0);
    }
    player.updateProjectionMatrix(); // Update the projection matrix after changing fov
  }
  if (controller["x"]?.pressed) {
    player.fov = clamp(player.fov + speed, 10, 180);
    const zoomStatus = document.getElementById("zoomStatus");
    if (zoomStatus) {
      zoomStatus.textContent = player.fov.toFixed(0);
    }
    player.updateProjectionMatrix(); // Update the projection matrix after changing fov
  }

  // Follow clock
  if (controller["f"]?.pressed) {
    follow = !follow; // Toggle follow mode
    console.log("Follow mode:", follow);
    const followStatus = document.getElementById("followStatus");
    if (followStatus) {
      followStatus.textContent = follow ? "ON" : "OFF";
    }
  }

  // Clear buffer
  if (controller["c"]?.pressed) {
    clearBuffer = !clearBuffer; // Toggle clear buffer
    console.log("Clear buffer mode:", clearBuffer);
    const clearBufferStatus = document.getElementById("clearBufferStatus");
    if (clearBufferStatus) {
      clearBufferStatus.textContent = clearBuffer ? "ON" : "OFF";
    }
    if (clearBuffer) {
      renderer.autoClear = true; // Enable clearing the buffer
      renderer.autoClearColor = true;
      renderer.setClearColor(0x000000, 1); // Set background color to black
    } else {
      renderer.autoClear = false; // Disable clearing the buffer
      renderer.autoClearColor = false;
    }
    //renderer.autoClearColor = false;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
