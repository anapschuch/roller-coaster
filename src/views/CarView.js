import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import BaseView from './BaseView';

export default class CarView extends BaseView {
  /**
   * @param {THREE.Group} car
   */
  constructor (car) {
    super(car);

    this.camera.position.set(0, 1 / 6 + 1 / 7 + 1, -0.3);
    this.camera.lookAt(new THREE.Vector3(0, 1.3, 1));

    this.controls = new PointerLockControls(this.camera, document.body);
  }

  activate() {
    if (this.isActive) return;

    const hint = this.hint = document.createElement('div');

    hint.innerText = 'Clique para travar o mouse';

    hint.classList.add('lock-click-hint', 'hidden');

    document.body.append(hint);

    setTimeout(() => hint.classList.remove('hidden'));

    setTimeout(() => hint.classList.add('hidden'), 4000);

    this.toggleLock = () => {
      if (this.controls.isLocked)
        this.controls.unlock();
      else
        this.controls.lock();

      hint.classList.add('hidden');
    };

    document.addEventListener('click', this.toggleLock);

    return super.activate();
  }

  deactivate() {
    if (!this.isActive) return;

    document.removeEventListener('click', this.toggleLock);

    this.controls.unlock();
    this.hint.remove();

    return super.deactivate();
  }
}
