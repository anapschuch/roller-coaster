import * as THREE from 'three';

export default class BaseCamera {
  /**
   * @param {THREE.Group} group
   */
  constructor(group) {
    this.camera = new THREE.PerspectiveCamera(
      75,
      innerWidth / innerHeight
    );

    group.add(this.camera);

    this.isActive = false;
  }

  activate() {
    this.isActive = true;

    return this;
  }

  deactivate() {
    this.isActive = false;

    return this;
  }

  update() {
    // Nada
  }
}
