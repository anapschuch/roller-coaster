import * as THREE from 'three';
import BaseView from './BaseView';

export default class DroneView extends BaseView {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Group} car
   */
  constructor(scene, car) {
    super(scene);

    this.car = car;
  }

  update() {
    this.camera.position
      .copy(this.car.position)
      .add(new THREE.Vector3(2, 3, -4));

    this.camera.lookAt(this.car.position);
  }
}
