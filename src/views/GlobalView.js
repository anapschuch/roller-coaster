import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import BaseView from './BaseView';

export default class GlobalView extends BaseView {
  /**
   * @param {THREE.Group} scene
   */
  constructor(scene) {
    super(scene);

    const element = document.querySelector('canvas');

    this.camera.position.set(0, 10, -30);

    this.controls = new OrbitControls(this.camera, element);

    this.controls.enabled = false;
  }

  activate() {
    this.controls.enabled = true;
    this.controls.enableZoom = false;

    return super.activate();
  }

  deactivate() {
    this.controls.enabled = false;

    return super.deactivate();
  }

  update() {
    this.controls.update();
  }
}
