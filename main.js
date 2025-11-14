import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LightingSystem } from './lighting.js';
import { CameraSystem } from './camera.js';
import { BookSystem } from './book.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x1a1215); // Change background color to dark warm tone
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap; // Use BasicShadowMap for sharper shadows

// Initialize systems
const lightingSystem = new LightingSystem(scene);
const cameraSystem = new CameraSystem(camera, renderer);
let bookSystem; // Will be initialized after models are loaded

// Handle pointer lock and book interaction
document.addEventListener('click', (event) => {
  if (cameraSystem.isPointerLocked()) {
    // If pointer is already locked, handle book interaction
    if (bookSystem) {
      bookSystem.handleClick(event);
    }
  } else {
    // If pointer is not locked, lock it
    cameraSystem.lock();
  }
});

// Load all models from the 'models' folder dynamically with different positions and scales
const modelPathsWithTransforms = [
  { path: './models/desk/scene.gltf', position: { x: 0, y: 0, z: 0 }, scale: { x: 0.01, y: 0.01, z: 0.01 } },
  { path: './models/chair/scene.gltf', position: { x: 0.577, y: 0, z: 1 }, scale: { x: 2, y: 2, z: 2 }, rotation: { x: 0, y: 5.05, z: 0 } },
  { path: './models/lamp/scene.gltf', position: { x: 1.6, y: 2.33, z: -0.5 }, scale: { x: 1, y: 1, z: 1 }, rotation: { x: 0, y: 7.1, z: 0 }},
  { path: './models/room/scene.gltf', position: { x: 0, y: 0, z: 0 }, scale: { x: 3, y: 3, z: 3}, rotation: { x: 0, y: -(3.1415/2), z: 0 }},
  { path: './models/computer/scene.gltf', position: { x: -.9, y: 1.78, z: 0 }, scale: { x: .015, y: .015, z: .015 }, rotation: { x: 0, y: .67, z: 0 }},
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

      // Initialize book system after first model is loaded (only once)
      if (!bookSystem) {
        bookSystem = new BookSystem(scene, camera, cameraSystem);
        bookSystem.setPage(0);
      }
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

// Add helpers for debugging
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Main animation loop
function animate() {
  // Update camera coordinates display
  cameraSystem.updateCoordinatesDisplay();

  // Update book system if initialized
  if (bookSystem) {
    bookSystem.update();
  }

  // Render the scene
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Start the animation loop
animate();

console.log('Portfolio loaded with modular systems: lighting, camera, and book.');


