import * as THREE from 'three';

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.ambientLight = null;
    this.pointLight = null;
    this.lightBulb = null;
    this.lightBulbLight = null;

    this.setupLighting();
  }

  setupLighting() {
    // Add ambient light - dark rosy romantic atmosphere
    this.ambientLight = new THREE.AmbientLight(0x331122, 0.15); // Very dim warm purple ambient
    this.scene.add(this.ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0x442233, 0.3); // Soft rosy directional
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    // Add point light for dramatic shadows
    this.pointLight = new THREE.PointLight(0xffbf80, 6, 50); // Warm amber point light
    this.pointLight.position.set(-2.75, 5.42, 5.11);
    this.pointLight.castShadow = true;

    // Configure shadow properties for the point light
    this.pointLight.shadow.bias = -0.005;
    this.pointLight.shadow.mapSize.width = 4096;
    this.pointLight.shadow.mapSize.height = 4096;
    this.pointLight.shadow.camera.near = 0.5;
    this.pointLight.shadow.camera.far = 50;

    this.scene.add(this.pointLight);

    this.setupLightBulb();
  }

  setupLightBulb() {
    // Create physical light bulb mesh
    const lightBulbGeometry = new THREE.SphereGeometry(0.06, 20, 20);
    const lightBulbMaterial = new THREE.MeshBasicMaterial({
      color: 0xffa500,
      emissive: 0xffa500
    });
    this.lightBulb = new THREE.Mesh(lightBulbGeometry, lightBulbMaterial);
    this.lightBulb.position.set(1.335, 2.59, -0.23);
    this.scene.add(this.lightBulb);

    // Add light source at the light bulb position
    this.lightBulbLight = new THREE.PointLight(0xffa500, 1, 10);
    this.lightBulbLight.position.set(1.335, 2.59, -0.23);
    this.scene.add(this.lightBulbLight);
  }

  // Method to adjust lighting intensity
  setAmbientIntensity(intensity) {
    if (this.ambientLight) {
      this.ambientLight.intensity = intensity;
    }
  }

  setPointLightIntensity(intensity) {
    if (this.pointLight) {
      this.pointLight.intensity = intensity;
    }
  }

  // Method to update light positions if needed
  updateLightPositions(pointLightPos, lightBulbPos) {
    if (pointLightPos && this.pointLight) {
      this.pointLight.position.set(pointLightPos.x, pointLightPos.y, pointLightPos.z);
    }

    if (lightBulbPos && this.lightBulb && this.lightBulbLight) {
      this.lightBulb.position.set(lightBulbPos.x, lightBulbPos.y, lightBulbPos.z);
      this.lightBulbLight.position.set(lightBulbPos.x, lightBulbPos.y, lightBulbPos.z);
    }
  }
}
