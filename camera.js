import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

export class CameraSystem {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.controls = null;
    this.crosshair = null;
    this.coordinatesDisplay = null;

    this.setupCamera();
    this.setupControls();
    this.setupUI();
  }

  setupCamera() {
    // Set initial camera position and rotation
    this.camera.position.set(0.517, 2.7, 1);
    this.camera.rotation.x = -Math.PI / 3; // Look down 45 degrees
  }

  setupControls() {
    // Initialize PointerLockControls for first-person look-around
    this.controls = new PointerLockControls(this.camera, document.body);
  }

  setupUI() {
    this.createCrosshair();
    this.createCoordinatesDisplay();
  }

  createCrosshair() {
    // Add a simple crosshair to the center of the screen
    this.crosshair = document.createElement('div');
    this.crosshair.style.position = 'absolute';
    this.crosshair.style.top = '50%';
    this.crosshair.style.left = '50%';
    this.crosshair.style.width = '10px';
    this.crosshair.style.height = '10px';
    this.crosshair.style.backgroundColor = 'red';
    this.crosshair.style.borderRadius = '50%';
    this.crosshair.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(this.crosshair);
  }

  createCoordinatesDisplay() {
    // Add a display for the camera's coordinates in the top-left corner
    this.coordinatesDisplay = document.createElement('div');
    this.coordinatesDisplay.style.position = 'absolute';
    this.coordinatesDisplay.style.top = '10px';
    this.coordinatesDisplay.style.left = '10px';
    this.coordinatesDisplay.style.color = 'white';
    this.coordinatesDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.coordinatesDisplay.style.padding = '5px';
    this.coordinatesDisplay.style.borderRadius = '5px';
    document.body.appendChild(this.coordinatesDisplay);
  }

  updateCoordinatesDisplay() {
    if (this.coordinatesDisplay) {
      const { x, y, z } = this.camera.position;
      this.coordinatesDisplay.textContent = `Camera: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`;
    }
  }

  // Crosshair manipulation methods
  setCrosshairColor(color) {
    if (this.crosshair) {
      this.crosshair.style.backgroundColor = color;
    }
  }

  setCrosshairScale(scale) {
    if (this.crosshair) {
      this.crosshair.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
  }

  resetCrosshair() {
    this.setCrosshairColor('red');
    this.setCrosshairScale(1.0);
  }

  // Get controls for external event handling
  getControls() {
    return this.controls;
  }

  // Check if pointer is locked
  isPointerLocked() {
    return this.controls.isLocked;
  }

  // Lock the pointer
  lock() {
    this.controls.lock();
  }
}
