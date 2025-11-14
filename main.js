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

// Handle pointer lock and book interaction
document.addEventListener('click', (event) => {
  if (controls.isLocked) {
    // If pointer is already locked, handle book interaction
    onBookMouseClick(event);
  } else {
    // If pointer is not locked, lock it
    controls.lock();
  }
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

// OrbitControls removed - using PointerLockControls for first-person view

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

// Start the animation loop (replaced by the book version below)

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


// Book
const BOOK_EASING_FACTOR = 0.5;
const BOOK_EASING_FACTOR_FOLD = 0.3;
const BOOK_INSIDE_CURVE_STRENGTH = 0.18;
const BOOK_OUTSIDE_CURVE_STRENGTH = 0.05;
const BOOK_TURNING_CURVE_STRENGTH = 0.09;

const BOOK_PAGE_WIDTH = 1.28;
const BOOK_PAGE_HEIGHT = 1.71;
const BOOK_PAGE_DEPTH = 0.003;
const BOOK_PAGE_SEGMENTS = 30;
const BOOK_SEGMENT_WIDTH = BOOK_PAGE_WIDTH / BOOK_PAGE_SEGMENTS;

// Book pages data
const bookPages = [
  { front: "book-cover", back: "book-back" },
  { front: "DSC00680", back: "DSC00933" },
  { front: "DSC00966", back: "DSC00983" },
  { front: "DSC00993", back: "DSC01011" },
  { front: "DSC01040", back: "DSC01064" },
  { front: "DSC01071", back: "DSC01103" },
  { front: "DSC01145", back: "DSC01420" },
  { front: "DSC01461", back: "DSC01489" },
  { front: "DSC02031", back: "DSC02064" },
  { front: "DSC02069", back: "book-back" }
];

// Book state
let bookCurrentPage = 0;
let bookTargetPage = 0;

// Texture loader for book
const bookTextureLoader = new THREE.TextureLoader();

// Book utility functions
function bookLerp(start, end, factor) {
  return start + (end - start) * factor;
}

function bookDegToRad(degrees) {
  return degrees * Math.PI / 180;
}

function bookDampAngle(current, target, factor, delta) {
  const diff = target - current;
  const dampedDiff = diff * (1 - Math.exp(-factor * delta * 60));
  return current + dampedDiff;
}

// Create book page geometry with skinning
function createBookPageGeometry() {
  const geometry = new THREE.BoxGeometry(
    BOOK_PAGE_WIDTH,
    BOOK_PAGE_HEIGHT,
    BOOK_PAGE_DEPTH,
    BOOK_PAGE_SEGMENTS,
    2
  );

  geometry.translate(BOOK_PAGE_WIDTH / 2, 0, 0);

  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const skinIndexes = [];
  const skinWeights = [];

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;

    const skinIndex = Math.max(0, Math.floor(x / BOOK_SEGMENT_WIDTH));
    let skinWeight = (x % BOOK_SEGMENT_WIDTH) / BOOK_SEGMENT_WIDTH;

    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }

  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndexes, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

  return geometry;
}

// Create book page materials
function createBookPageMaterials(front, back, number, pictureRoughness) {
  const whiteColor = new THREE.Color('white');
  const emissiveColor = new THREE.Color('orange');

  // Use fallback colors if textures fail to load
  const frontTexture = bookTextureLoader.load(
    `./book/r3f-animated-book-slider-final-main/public/textures/${front}.jpg`,
    undefined,
    undefined,
    () => console.warn(`Failed to load texture: ${front}.jpg`)
  );
  const backTexture = bookTextureLoader.load(
    `./book/r3f-animated-book-slider-final-main/public/textures/${back}.jpg`,
    undefined,
    undefined,
    () => console.warn(`Failed to load texture: ${back}.jpg`)
  );

  frontTexture.colorSpace = backTexture.colorSpace = THREE.SRGBColorSpace;

  return [
    new THREE.MeshStandardMaterial({ color: whiteColor }),
    new THREE.MeshStandardMaterial({ color: '#111' }),
    new THREE.MeshStandardMaterial({ color: whiteColor }),
    new THREE.MeshStandardMaterial({ color: whiteColor }),
    new THREE.MeshStandardMaterial({
      color: whiteColor,
      map: frontTexture,
      roughness: number === 0 ? undefined : 0.1,
      roughnessMap: number === 0 ? pictureRoughness : undefined,
      emissive: emissiveColor,
      emissiveIntensity: 0
    }),
    new THREE.MeshStandardMaterial({
      color: whiteColor,
      map: backTexture,
      roughness: number === bookPages.length - 1 ? undefined : 0.1,
      roughnessMap: number === bookPages.length - 1 ? pictureRoughness : undefined,
      emissive: emissiveColor,
      emissiveIntensity: 0
    })
  ];
}

// Book Page class
class BookPage {
  constructor(number, front, back) {
    this.number = number;
    this.front = front;
    this.back = back;
    this.opened = false;
    this.turnedAt = 0;
    this.lastOpened = false;
    this.highlighted = false;

    // Load roughness texture if needed
    const pictureRoughness = (number === 0 || number === bookPages.length - 1)
      ? bookTextureLoader.load('./book/r3f-animated-book-slider-final-main/public/textures/book-cover-roughness.jpg')
      : null;

    // Create geometry and materials
    this.geometry = createBookPageGeometry();
    this.materials = createBookPageMaterials(front, back, number, pictureRoughness);

    // Create bones
    this.bones = [];
    for (let i = 0; i <= BOOK_PAGE_SEGMENTS; i++) {
      const bone = new THREE.Bone();
      this.bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = BOOK_SEGMENT_WIDTH;
      }
      if (i > 0) {
        this.bones[i - 1].add(bone);
      }
    }

    // Create skeleton and mesh
    this.skeleton = new THREE.Skeleton(this.bones);
    this.mesh = new THREE.SkinnedMesh(this.geometry, this.materials);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    this.mesh.add(this.skeleton.bones[0]);
    this.mesh.bind(this.skeleton);

    // Create group
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    this.mesh.position.z = -number * BOOK_PAGE_DEPTH;
  }

  update(delta, bookClosed) {
    // Update emissive intensity
    const emissiveIntensity = this.highlighted ? 0.22 : 0;
    this.materials[4].emissiveIntensity = bookLerp(
      this.materials[4].emissiveIntensity,
      emissiveIntensity,
      0.1
    );
    this.materials[5].emissiveIntensity = this.materials[4].emissiveIntensity;

    // Handle page turning
    if (this.lastOpened !== this.opened) {
      this.turnedAt = Date.now();
      this.lastOpened = this.opened;
    }

    let turningTime = Math.min(400, Date.now() - this.turnedAt) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = this.opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += bookDegToRad(this.number * 0.8);
    }

    // Animate bones
    for (let i = 0; i < this.bones.length; i++) {
      const target = i === 0 ? this.group : this.bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity = Math.sin(i * Math.PI * (1 / this.bones.length)) * turningTime;

      let rotationAngle =
        BOOK_INSIDE_CURVE_STRENGTH * insideCurveIntensity * targetRotation -
        BOOK_OUTSIDE_CURVE_STRENGTH * outsideCurveIntensity * targetRotation +
        BOOK_TURNING_CURVE_STRENGTH * turningIntensity * targetRotation;

      let foldRotationAngle = bookDegToRad(Math.sign(targetRotation) * 2);

      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }

      target.rotation.y = bookDampAngle(target.rotation.y, rotationAngle, BOOK_EASING_FACTOR, delta);

      const foldIntensity = i > 8
        ? Math.sin(i * Math.PI * (1 / this.bones.length) - 0.5) * turningTime
        : 0;

      target.rotation.x = bookDampAngle(
        target.rotation.x,
        foldRotationAngle * foldIntensity,
        BOOK_EASING_FACTOR_FOLD,
        delta
      );
    }
  }
}

// Book class
class Book {
  constructor() {
    this.pages = [];
    this.group = new THREE.Group();
    this.group.rotation.y = -Math.PI / 2;
    this.group.rotation.z = Math.PI / 2;

    // Create all pages
    bookPages.forEach((pageData, index) => {
      const page = new BookPage(index, pageData.front, pageData.back);
      this.pages.push(page);
      this.group.add(page.group);
    });

    // Position the book on the desk
    this.group.position.set(.5, 2, .4);
    this.group.scale.set(0.5, 0.5, 0.5);

    scene.add(this.group);
  }

  update(delta) {
    const bookClosed = bookCurrentPage === 0 || bookCurrentPage === bookPages.length;

    this.pages.forEach((page, index) => {
      page.opened = bookCurrentPage > index;
      page.update(delta, bookClosed);
    });
  }

  setPage(pageNumber) {
    bookTargetPage = Math.max(0, Math.min(bookPages.length, pageNumber));
  }
}

// Create book instance
const portfolioBook = new Book();

// Book mouse interaction
const bookRaycaster = new THREE.Raycaster();
const bookMouse = new THREE.Vector2();

function onBookMouseMove(event) {
  // Use crosshair position (center of screen) instead of mouse position
  bookMouse.x = 0; // Center of screen
  bookMouse.y = 0; // Center of screen

  bookRaycaster.setFromCamera(bookMouse, camera);
  const intersects = bookRaycaster.intersectObjects(portfolioBook.pages.map(p => p.mesh));

  // Reset all highlights
  portfolioBook.pages.forEach(page => page.highlighted = false);

  if (intersects.length > 0) {
    const intersectedPage = portfolioBook.pages.find(p => p.mesh === intersects[0].object);
    if (intersectedPage) {
      intersectedPage.highlighted = true;
      // Change crosshair color when hovering over a page
      crosshair.style.backgroundColor = 'orange';
    }
  } else {
    // Reset crosshair color when not hovering over a page
    crosshair.style.backgroundColor = 'red';
  }
}

function onBookMouseClick(event) {
  // Use crosshair position (center of screen) instead of mouse position
  bookMouse.x = 0; // Center of screen
  bookMouse.y = 0; // Center of screen

  bookRaycaster.setFromCamera(bookMouse, camera);
  const intersects = bookRaycaster.intersectObjects(portfolioBook.pages.map(p => p.mesh));

  if (intersects.length > 0) {
    const intersectedPage = portfolioBook.pages.find(p => p.mesh === intersects[0].object);
    if (intersectedPage) {
      const newPage = intersectedPage.opened
        ? intersectedPage.number
        : intersectedPage.number + 1;
      portfolioBook.setPage(newPage);

      // Visual feedback for successful click
      crosshair.style.backgroundColor = 'yellow';
      setTimeout(() => {
        crosshair.style.backgroundColor = 'red';
      }, 200);

      // Prevent the event from propagating to camera controls
      event.stopPropagation();
    }
  }
}

// Add book event listeners for mouse move only
renderer.domElement.addEventListener('mousemove', onBookMouseMove);

// Book keyboard controls
window.addEventListener('keydown', (event) => {
  switch(event.key) {
    case 'ArrowLeft':
      portfolioBook.setPage(Math.max(0, bookTargetPage - 1));
      event.preventDefault();
      break;
    case 'ArrowRight':
      portfolioBook.setPage(Math.min(bookPages.length, bookTargetPage + 1));
      event.preventDefault();
      break;
  }
});

// Book animation clock
const bookClock = new THREE.Clock();

// Update the render loop to include book animation
function animate() {
  const bookDelta = bookClock.getDelta();

  // Smooth page transitions for book
  if (bookCurrentPage !== bookTargetPage) {
    const diff = bookTargetPage - bookCurrentPage;
    const step = Math.abs(diff) > 2 ? 0.02 : 0.01;
    bookCurrentPage = bookLerp(bookCurrentPage, bookTargetPage, step);

    if (Math.abs(bookCurrentPage - bookTargetPage) < 0.01) {
      bookCurrentPage = bookTargetPage;
    }
  }

  portfolioBook.update(bookDelta);

  // Update crosshair interaction with book pages
  onBookMouseMove();

  updateCameraCoordinates();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Initialize and start the portfolio
portfolioBook.setPage(0);
animate();

console.log('Portfolio loaded with advanced book. Use arrow keys or click on pages to navigate the book.');