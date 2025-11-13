import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x808080); // Change background color to gray
renderer.shadowMap.enabled = true;

// Initialize PointerLockControls for first-person look-around
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
  controls.lock(); // Lock the pointer on click
});

// Enable shadows in the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap; // Use BasicShadowMap for sharper shadows

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Add another directional light at the specified position
const additionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // White light with higher intensity
additionalLight.position.set(-2.75, 5.42, 5.11); // Set light position
additionalLight.castShadow = true; // Enable shadow casting

// Configure shadow properties for the additional light
additionalLight.shadow.mapSize.width = 2048; // High resolution for sharper shadows
additionalLight.shadow.mapSize.height = 2048;
additionalLight.shadow.camera.near = 0.1; // Near clipping plane for detailed shadows
additionalLight.shadow.camera.far = 100; // Far clipping plane for larger shadow coverage

scene.add(additionalLight);

// Load all models from the 'models' folder dynamically with different positions and scales
const modelPathsWithTransforms = [
  { path: './models/desk/scene.gltf', position: { x: 0, y: 0, z: 0 }, scale: { x: 0.01, y: 0.01, z: 0.01 } },
  { path: './models/chair/scene.gltf', position: { x: .15, y: 0, z: 1 }, scale: { x: 2, y: 2, z: 2 }, rotation: { x: 0, y: 5.05, z: 0 } },
  { path: './models/lamp/scene.gltf', position: { x: 1.6, y: 2.33, z: -0.5 }, scale: { x: 1, y: 1, z: 1 }, rotation: { x: 0, y: 7.1, z: 0 }},
  { path: './models/room/scene.gltf', position: { x: 0, y: 0, z: 0 }, scale: { x: 3, y: 3, z: 3}, rotation: { x: 0, y: -(3.1415/2), z: 0 }},
  { path: './models/computer/scene.gltf', position: { x: -.8, y: 1.78, z: 0 }, scale: { x: .015, y: .015, z: .015 }, rotation: { x: 0, y: .67, z: 0 }},
];

const loader = new GLTFLoader();
modelPathsWithTransforms.forEach(({ path, position, scale, rotation }) => {
  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;
      model.position.set(position.x, position.y, position.z); // Set unique position for each model
      model.scale.set(scale.x, scale.y, scale.z); // Set unique scale for each model
      if (rotation) {
        model.rotation.set(rotation.x, rotation.y, rotation.z); // Set unique rotation for each model
      }

      // Traverse through all child meshes to adjust material properties and enable shadows
      model.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = false; // Disable transparency
          child.material.opacity = 1; // Set full opacity
          child.material.depthWrite = true; // Ensure proper depth writing
          child.material.depthTest = true; // Ensure proper depth testing
          child.castShadow = true; // Enable shadow casting for objects
          child.receiveShadow = true; // Enable shadow receiving for objects
        }
      });

      scene.add(model);

      // Log model path, position, and scale for debugging
      console.log(`Loaded model from: ${path} at position:`, position, 'with scale:', scale);
    },
    undefined,
    (error) => {
      console.error(`An error occurred while loading the model from ${path}:`, error);
    }
  );
});

// Ensure all objects cast and receive shadows
scene.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true; // Enable shadow casting for objects
    child.receiveShadow = true; // Enable shadow receiving for objects
  }
});

// Adjust ambient light to create more dramatic contrast
ambientLight.intensity = 0.4; // Lower ambient light for darker shadows

// Move the pointLight declaration to the top-level scope
let pointLight; // Declare pointLight in the top-level scope

// Replace the directional light with a point light to create a point-like light source
scene.remove(additionalLight);

pointLight = new THREE.PointLight(0xffffff, 10, 50); // White point light with intensity and range
pointLight.position.set(-2.75, 5.42, 5.11); // Set light position
pointLight.castShadow = true; // Enable shadow casting

// Configure shadow properties for the point light
pointLight.shadow.bias = -0.005; // Reduce shadow acne for cleaner shadows
pointLight.shadow.mapSize.width = 4096; // Increase resolution for sharper shadows
pointLight.shadow.mapSize.height = 4096;
pointLight.shadow.camera.near = 0.5; // Near clipping plane for better shadow detail
pointLight.shadow.camera.far = 50; // Far clipping plane for better shadow coverage

scene.add(pointLight);

// Add helpers for debugging
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Reset camera position and animation logic
camera.position.set(.09, 2.8, 1.1); // camera position

// Initialize OrbitControls for third-person view
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.target.set(0, 0, 0); // Set the orbit target to the origin
orbitControls.enableDamping = true; // Enable smooth motion
orbitControls.dampingFactor = 0.05; // Adjust damping factor
orbitControls.enableZoom = true; // Allow zooming
orbitControls.enablePan = true; // Allow panning

// Add a simple crosshair to the center of the screen
const crosshair = document.createElement('div');
crosshair.style.position = 'absolute';
crosshair.style.top = '50%';
crosshair.style.left = '50%';
crosshair.style.width = '10px';
crosshair.style.height = '10px';
crosshair.style.backgroundColor = 'red';
crosshair.style.borderRadius = '50%';
crosshair.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(crosshair);

// Add a display for the camera's coordinates in the top-left corner
const cameraCoordinates = document.createElement('div');
cameraCoordinates.style.position = 'absolute';
cameraCoordinates.style.top = '10px';
cameraCoordinates.style.left = '10px';
cameraCoordinates.style.color = 'white';
cameraCoordinates.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
cameraCoordinates.style.padding = '5px';
cameraCoordinates.style.borderRadius = '5px';
document.body.appendChild(cameraCoordinates);

function updateCameraCoordinates() {
  const { x, y, z } = camera.position;
  cameraCoordinates.textContent = `Camera: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`;
}

// Render loop
function animate() {
  updateCameraCoordinates();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Light bulb
const lightBulbGeometry = new THREE.SphereGeometry(0.06, 20, 20); // Reduced sphere size for the light bulb
const lightBulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500, emissive: 0xffa500 }); // Orange-yellow glowing material
const lightBulb = new THREE.Mesh(lightBulbGeometry, lightBulbMaterial);
lightBulb.position.set(1.335, 2.59, -0.23); // Place at the origin
scene.add(lightBulb);

// Update the light bulb to emit light as a small orange light source
const lightBulbLight = new THREE.PointLight(0xffa500, 1, 10); // Small orange point light with limited range
lightBulbLight.position.set(1.335, 2.59, -0.23); // Place at the same position as the light bulb
scene.add(lightBulbLight);