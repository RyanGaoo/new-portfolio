import * as THREE from 'three';

// Book constants
const BOOK_EASING_FACTOR = 0.8;
const BOOK_EASING_FACTOR_FOLD = 0.6;
const BOOK_INSIDE_CURVE_STRENGTH = 0.05;
const BOOK_OUTSIDE_CURVE_STRENGTH = 0.02;
const BOOK_TURNING_CURVE_STRENGTH = 0.03;

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

// Utility functions
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
function createBookPageMaterials(front, back, number, bookTextureLoader) {
  const whiteColor = new THREE.Color('white');
  const emissiveColor = new THREE.Color('orange');
  const beigeColor = new THREE.Color(0xF5F5DC);

  let frontMaterial, backMaterial;

  // Try to load front texture
  const frontTexture = bookTextureLoader.load(
    `./book/r3f-animated-book-slider-final-main/public/textures/${front}.jpg`,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      frontMaterial.map = texture;
      frontMaterial.color = whiteColor;
      frontMaterial.needsUpdate = true;
    },
    undefined,
    (error) => {
      console.warn(`Failed to load texture: ${front}.jpg, using beige fallback`);
      frontMaterial.map = null;
      frontMaterial.color = beigeColor;
      frontMaterial.needsUpdate = true;
    }
  );

  // Try to load back texture
  const backTexture = bookTextureLoader.load(
    `./book/r3f-animated-book-slider-final-main/public/textures/${back}.jpg`,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      backMaterial.map = texture;
      backMaterial.color = whiteColor;
      backMaterial.needsUpdate = true;
    },
    undefined,
    (error) => {
      console.warn(`Failed to load texture: ${back}.jpg, using beige fallback`);
      backMaterial.map = null;
      backMaterial.color = beigeColor;
      backMaterial.needsUpdate = true;
    }
  );

  // Create materials with initial beige color
  frontMaterial = new THREE.MeshStandardMaterial({
    color: beigeColor,
    emissive: emissiveColor,
    emissiveIntensity: 0,
    roughness: number === 0 ? 0.5 : 0.1
  });

  backMaterial = new THREE.MeshStandardMaterial({
    color: beigeColor,
    emissive: emissiveColor,
    emissiveIntensity: 0,
    roughness: number === bookPages.length - 1 ? 0.5 : 0.1
  });

  return [
    new THREE.MeshStandardMaterial({ color: beigeColor }), // Top edge
    new THREE.MeshStandardMaterial({ color: '#DDD8C7' }), // Bottom edge
    new THREE.MeshStandardMaterial({ color: beigeColor }), // Left edge
    new THREE.MeshStandardMaterial({ color: beigeColor }), // Right edge
    frontMaterial, // Front face
    backMaterial   // Back face
  ];
}

// Create book page tab
function createBookPageTab(pageNumber, totalPages) {
  const tabGroup = new THREE.Group();

  // Tab dimensions
  const tabWidth = 0.08;
  const tabHeight = 0.15;
  const tabDepth = 0.008;

  // Create tab geometry
  const tabShape = new THREE.Shape();
  const radius = 0.02;

  // Draw tab shape with rounded top corners
  tabShape.moveTo(-tabWidth/2, -tabHeight/2);
  tabShape.lineTo(-tabWidth/2, tabHeight/2 - radius);
  tabShape.quadraticCurveTo(-tabWidth/2, tabHeight/2, -tabWidth/2 + radius, tabHeight/2);
  tabShape.lineTo(tabWidth/2 - radius, tabHeight/2);
  tabShape.quadraticCurveTo(tabWidth/2, tabHeight/2, tabWidth/2, tabHeight/2 - radius);
  tabShape.lineTo(tabWidth/2, -tabHeight/2);
  tabShape.lineTo(-tabWidth/2, -tabHeight/2);

  const tabGeometry = new THREE.ExtrudeGeometry(tabShape, {
    depth: tabDepth,
    bevelEnabled: false
  });

  // Tab material
  const tabMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xF4E4BC),
    roughness: 0.8,
    metalness: 0.1
  });

  const tabMesh = new THREE.Mesh(tabGeometry, tabMaterial);
  tabMesh.castShadow = true;
  tabMesh.receiveShadow = true;

  // Position tab
  const visibleTabPages = totalPages - 2;
  const tabIndex = pageNumber - 1;
  const offsetY = -(tabIndex / (visibleTabPages - 1)) * 0.6 + 0.3;
  tabMesh.position.set(BOOK_PAGE_WIDTH * 0.52 + .67, BOOK_PAGE_HEIGHT * 0.35 + offsetY, tabDepth/2);
  tabMesh.rotation.z = 0;

  // Store material reference for highlighting
  tabGroup.material = tabMaterial;
  tabGroup.add(tabMesh);

  // Store reference for raycasting
  tabMesh.userData = { pageNumber: pageNumber, isTab: true };

  return tabGroup;
}

// Book Page class
class BookPage {
  constructor(number, front, back, bookTextureLoader) {
    this.number = number;
    this.front = front;
    this.back = back;
    this.opened = false;
    this.turnedAt = 0;
    this.lastOpened = false;
    this.highlighted = false;

    // Create geometry and materials
    this.geometry = createBookPageGeometry();
    this.materials = createBookPageMaterials(front, back, number, bookTextureLoader);

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

    // Create tab for this page
    this.tab = createBookPageTab(number, bookPages.length);

    // Create group
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    this.group.add(this.tab);
    this.mesh.position.z = -number * BOOK_PAGE_DEPTH;
  }

  update(delta, bookClosed) {
    // Update emissive intensity for pages
    const emissiveIntensity = this.highlighted ? 0.22 : 0;
    this.materials[4].emissiveIntensity = bookLerp(
      this.materials[4].emissiveIntensity,
      emissiveIntensity,
      0.1
    );
    this.materials[5].emissiveIntensity = this.materials[4].emissiveIntensity;

    // Update tab highlighting
    if (this.tab && this.tab.material) {
      const tabEmissiveIntensity = this.highlighted ? 0.3 : 0;
      this.tab.material.emissive = this.highlighted ? new THREE.Color(0xffaa00) : new THREE.Color(0x000000);
      this.tab.material.emissiveIntensity = bookLerp(
        this.tab.material.emissiveIntensity || 0,
        tabEmissiveIntensity,
        0.1
      );
    }

    // Show/hide tabs
    if (this.tab) {
      const shouldShowTab = !bookClosed && !this.opened && this.number > 0;
      this.tab.visible = shouldShowTab;
    }

    // Handle page turning
    if (this.lastOpened !== this.opened) {
      this.turnedAt = Date.now();
      this.lastOpened = this.opened;
    }

    let turningTime = Math.min(200, Date.now() - this.turnedAt) / 200;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = this.opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += bookDegToRad(this.number * 0.2);
    }

    // Animate bones
    for (let i = 0; i < this.bones.length; i++) {
      const target = i === 0 ? this.group : this.bones[i];

      let rotationAngle = 0;
      let foldRotationAngle = 0;

      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
        }
      } else {
        if (turningTime < 0.05) {
          if (i === 0) {
            rotationAngle = this.opened ? -Math.PI / 2 : Math.PI / 2;
          } else {
            rotationAngle = 0;
          }
        } else {
          const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
          const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
          const turningIntensity = Math.sin(i * Math.PI * (1 / this.bones.length)) * turningTime;

          rotationAngle =
            BOOK_INSIDE_CURVE_STRENGTH * insideCurveIntensity * targetRotation -
            BOOK_OUTSIDE_CURVE_STRENGTH * outsideCurveIntensity * targetRotation +
            BOOK_TURNING_CURVE_STRENGTH * turningIntensity * targetRotation;

          foldRotationAngle = bookDegToRad(Math.sign(targetRotation) * 2);
        }
      }

      target.rotation.y = bookDampAngle(target.rotation.y, rotationAngle, BOOK_EASING_FACTOR, delta);

      let finalFoldRotation = 0;
      if (turningTime >= 0.05 && !bookClosed) {
        const foldIntensity = i > 8
          ? Math.sin(i * Math.PI * (1 / this.bones.length) - 0.5) * turningTime
          : 0;
        finalFoldRotation = foldRotationAngle * foldIntensity;
      }

      target.rotation.x = bookDampAngle(
        target.rotation.x,
        finalFoldRotation,
        BOOK_EASING_FACTOR_FOLD,
        delta
      );
    }
  }
}

// Book class
export class BookSystem {
  constructor(scene, camera, cameraSystem) {
    this.scene = scene;
    this.camera = camera;
    this.cameraSystem = cameraSystem;
    this.pages = [];
    this.group = new THREE.Group();
    this.currentPage = 0;
    this.targetPage = 0;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.bookTextureLoader = new THREE.TextureLoader();

    this.setupBook();
    this.setupEventListeners();
  }

  setupBook() {
    this.group.rotation.y = -Math.PI / 2;
    this.group.rotation.z = Math.PI / 2;

    // Create all pages
    bookPages.forEach((pageData, index) => {
      const page = new BookPage(index, pageData.front, pageData.back, this.bookTextureLoader);
      this.pages.push(page);
      this.group.add(page.group);
    });

    // Position the book on the desk
    this.group.position.set(.5, 2, .4);
    this.group.scale.set(0.5, 0.5, 0.5);

    this.scene.add(this.group);
  }

  setupEventListeners() {
    // Mouse move for highlighting
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));

    // Keyboard controls
    window.addEventListener('keydown', (event) => {
      switch(event.key) {
        case 'ArrowLeft':
          this.setPage(Math.max(0, this.targetPage - 1));
          event.preventDefault();
          break;
        case 'ArrowRight':
          this.setPage(Math.min(bookPages.length, this.targetPage + 1));
          event.preventDefault();
          break;
      }
    });
  }

  onMouseMove(event) {
    // Use crosshair position (center of screen)
    this.mouse.x = 0;
    this.mouse.y = 0;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Get all meshes for raycasting
    const allMeshes = [];
    this.pages.forEach(page => {
      allMeshes.push(page.mesh);
      page.tab.traverse((child) => {
        if (child.isMesh) {
          allMeshes.push(child);
        }
      });
    });

    const intersects = this.raycaster.intersectObjects(allMeshes);

    // Reset all highlights
    this.pages.forEach(page => page.highlighted = false);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;

      // Check if it's a tab
      if (intersectedObject.userData && intersectedObject.userData.isTab) {
        const pageNumber = intersectedObject.userData.pageNumber;
        const correspondingPage = this.pages[pageNumber];
        if (correspondingPage) {
          correspondingPage.highlighted = true;
        }
        this.cameraSystem.setCrosshairColor('yellow');
        this.cameraSystem.setCrosshairScale(1.2);
      } else {
        // Check if it's a page
        const intersectedPage = this.pages.find(p => p.mesh === intersectedObject);
        if (intersectedPage) {
          intersectedPage.highlighted = true;
          this.cameraSystem.setCrosshairColor('orange');
          this.cameraSystem.setCrosshairScale(1.0);
        }
      }
    } else {
      this.cameraSystem.resetCrosshair();
    }
  }

  onMouseClick(event) {
    this.mouse.x = 0;
    this.mouse.y = 0;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const allMeshes = [];
    this.pages.forEach(page => {
      allMeshes.push(page.mesh);
      page.tab.traverse((child) => {
        if (child.isMesh) {
          allMeshes.push(child);
        }
      });
    });

    const intersects = this.raycaster.intersectObjects(allMeshes);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;

      // Check if it's a tab click
      if (intersectedObject.userData && intersectedObject.userData.isTab) {
        const targetPageNumber = intersectedObject.userData.pageNumber + 1;
        this.setPage(targetPageNumber);

        this.cameraSystem.setCrosshairColor('lime');
        setTimeout(() => {
          this.cameraSystem.resetCrosshair();
        }, 300);

        event.stopPropagation();
        return;
      }

      // Regular page click
      const intersectedPage = this.pages.find(p => p.mesh === intersectedObject);
      if (intersectedPage) {
        const newPage = intersectedPage.opened
          ? intersectedPage.number
          : intersectedPage.number + 1;
        this.setPage(newPage);

        this.cameraSystem.setCrosshairColor('yellow');
        setTimeout(() => {
          this.cameraSystem.resetCrosshair();
        }, 200);

        event.stopPropagation();
      }
    }
  }

  update() {
    const delta = this.clock.getDelta();
    const bookClosed = this.currentPage === 0 || this.currentPage === bookPages.length;

    // Animate book position based on open/closed state
    let targetX;
    if (bookClosed) {
      targetX = this.currentPage === 0 ? 0.2 : 0.8;
    } else {
      targetX = 0.52;
    }
    this.group.position.x = bookLerp(this.group.position.x, targetX, 0.05);

    // Smooth page transitions
    if (this.currentPage !== this.targetPage) {
      const diff = this.targetPage - this.currentPage;
      const step = Math.abs(diff) > 2 ? 0.05 : 0.03;
      this.currentPage = bookLerp(this.currentPage, this.targetPage, step);

      if (Math.abs(this.currentPage - this.targetPage) < 0.01) {
        this.currentPage = this.targetPage;
      }
    }

    // Update all pages
    this.pages.forEach((page, index) => {
      page.opened = this.currentPage > index;
      page.update(delta, bookClosed);
    });
  }

  setPage(pageNumber) {
    this.targetPage = Math.max(0, Math.min(bookPages.length, pageNumber));
  }

  // Method to be called from main click handler
  handleClick(event) {
    this.onMouseClick(event);
  }
}
