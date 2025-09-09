import * as THREE from "three";
import { FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import "./controls.css";

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
let activeCamera = camera;

const orbitCamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
orbitCamera.position.set(5, 5, 5);
orbitCamera.lookAt(0, 0, 0);
orbitCamera.name = "orbitCamera";
const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
scene.add(orbitCamera);

const light = new THREE.PointLight(0xffffff, 50);
light.position.set(0.8, 1.4, 1.0);
scene.add(light);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const grid = new THREE.GridHelper(10, 10);
grid.name = "grid"; // Set a name for the grid to access it later
scene.add(grid);

const axis = new THREE.AxesHelper(10);
axis.name = "axis"; // Set a name for the axis to access it later
scene.add(axis);

// scene setup

const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  //wireframe: true,
  roughness: 0.5,
});
const normalMaterial = new THREE.MeshNormalMaterial();
const calizStella_mat = new THREE.MeshPhysicalMaterial({
  metalness: 0.9,
  roughness: 0.05,
  envMapIntensity: 0.9,
  clearcoat: 1,
  transparent: true,
  // transmission: .95,
  opacity: 0.5,
  reflectivity: 0.2,
  //refractionRatio: 0.985,
  ior: 0.9,
  side: THREE.BackSide,
});

const threeTone = new THREE.TextureLoader().load(
  "/assets/gradientMaps/threeTone.jpg"
);
threeTone.minFilter = THREE.NearestFilter;
threeTone.magFilter = THREE.NearestFilter;

const fbxLoader = new FBXLoader();
fbxLoader.load(
  "/assets/blender-head-mixamo-fixed.fbx",
  (object) => {
    // object.traverse(function (child) {
    //     if ((child as THREE.Mesh).isMesh) {
    //         // (child as THREE.Mesh).material = material
    //         if ((child as THREE.Mesh).material) {
    //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
    //         }
    //     }
    // })
    object.traverse((child) => {
      const meshChild = child as THREE.Mesh;
      if (meshChild.isMesh) {
        console.log(meshChild.name, meshChild);
        meshChild.material = normalMaterial;
        //material;
        if (meshChild.material && meshChild.name !== "blenderhead") {
          (meshChild.material as THREE.MeshBasicMaterial).transparent = false;
        } else {
          //(meshChild.material as THREE.MeshBasicMaterial).transparent = true;
          //(meshChild.material as THREE.MeshBasicMaterial).opacity = 0.5;
          //(meshChild.material as THREE.MeshStandardMaterial).roughness = 0.1;
          //(meshChild.material as THREE.MeshStandardMaterial).metalness = 0.9;
          //(meshChild.material as THREE.MeshStandardMaterial).opacity = 0.1;
          //(meshChild.material as THREE.MeshStandardMaterial).transparent = true;
          //(meshChild.material as THREE.MeshStandardMaterial).
          meshChild.material = calizStella_mat;
          meshChild.material = new THREE.MeshToonMaterial({
            color: 0xbfff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            gradientMap: threeTone,
            depthTest: true,
            depthWrite: true,
            alphaTest: 0,
          });
          meshChild.material = normalMaterial;
        }
      }
    });
    object.scale.set(0.01, 0.01, 0.01);
    scene.add(object);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

// update loop

let lastTimestamp = performance.now();
animate();

var follow = false;

var clearBuffer = false;

function animate() {
  //const timestamp = requestAnimationFrame(animate);
  const timestamp = performance.now();
  const delta = (timestamp - lastTimestamp) / 1000; // Convert to seconds
  update(delta);
  handleCameraController(delta);
  lastTimestamp = timestamp;
  renderer.render(scene, activeCamera);
  requestAnimationFrame(animate);
}

function update(_delta: number) {
  if (follow) {
    const model = scene.getObjectByName("blenderhead");
    if (model) {
      orbitCamera.lookAt(model.position);
    }
    activeCamera = orbitCamera;
    orbitControls.enabled = true;
    orbitControls.update();
  } else {
    activeCamera = camera;
    orbitControls.enabled = false;
  }
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
  var player = activeCamera as THREE.PerspectiveCamera;
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
