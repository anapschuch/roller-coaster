import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as views from './views';
import car from './car';

if (import.meta.env.PROD) {
  // Ignorar todos os console.log no build final
  console.log = () => { /* ignore */ };
}

const scene = new THREE.Scene();

const loader = new OBJLoader();

async function main() {
  // Primeiro, esperamos que todos os objetos sejam carregados
  const [curvePath, curveLine] = await Promise.all([
    loader.loadAsync('/roller-coaster-curve.obj').then(object => {
      const curveGeometry = object.children[0].geometry;
      console.log(curveGeometry);
      const coordinates = curveGeometry.getAttribute('position');
      console.log(coordinates);
      const points = [];

      for (let i = 0; i < 3 * coordinates.count; i += 3) {
        points.push(
          new THREE.Vector3(
            coordinates.array[i],
            coordinates.array[i + 1],
            coordinates.array[i + 2]
          )
        );
      }
      return new THREE.CatmullRomCurve3(points);
    }),
    loader.loadAsync('/roller-coaster.obj').then(object => {
      const curveGeometry = object.children[0].geometry;
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

      return new THREE.Line(curveGeometry, material);
    })
  ]);

  document.getElementById('loading').remove();

  const canvas = document.querySelector('canvas');

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
    alpha: true
  });

  const view = (() => {
    const loadedViews = {
      car: new views.CarView(car),
      global: new views.GlobalView(scene)
    };

    let current = loadedViews.global.activate();

    return {
      get: () => current,
      /**@param {keyof typeof loadedViews} id */
      set(id) {
        const $new = loadedViews[id];
        if (current === $new) return;

        current.deactivate();
        current = $new.activate();
      }
    }
  })();

  function updateViewport() {
    // Definição do tamanho da vista
    const { camera } = view.get();
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  updateViewport();

  if (window.ResizeObserver) {
    new ResizeObserver(updateViewport).observe(document.body);
  }
  else {
    window.addEventListener('resize', updateViewport);
  }

  const plane = new THREE.GridHelper(60, 10);

  scene.add(plane);
  scene.add(car);
  scene.add(curveLine);

  let counter = 0;

  function animateCar() {
    counter += 0.001;
    counter %= 1;

    const newPos = curvePath.getPointAt(counter);
    const pointInFront = curvePath.getPointAt((counter + 0.01) % 1);

    car.position.copy(newPos);

    const oldDir = new THREE.Vector3();
    const newDir = new THREE.Vector3();

    car.getWorldDirection(oldDir);
    newDir.subVectors(pointInFront, car.position).normalize();

    const theta = Math.acos(newDir.dot(oldDir));

    const axis = new THREE.Vector3().crossVectors(oldDir, newDir).normalize();

    car.rotateOnWorldAxis(axis, theta);
  }

  function animate() {
    const currentView = view.get();

    renderer.render(scene, currentView.camera);
    requestAnimationFrame(animate);
    currentView.update();
    animateCar();
  }

  window.addEventListener('keypress', e => {
    switch (e.key) {
      case '1': return view.set('global');
      case '2': return view.set('car');
    }
  });

  animate();
}

main();
