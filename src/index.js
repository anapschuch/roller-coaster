import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight
  );

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
    alpha: true
  });

  function setView() {
    // Definição do tamanho da vista
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  setView();
  window.addEventListener('resize', setView);

  const controls = new OrbitControls(camera, renderer.domElement);

  const plane = new THREE.GridHelper(60, 10);

  scene.add(plane);
  scene.add(car);
  scene.add(curveLine);

  let counter = 0;
  let mustRotate = false;
  let rotateTwice = false;

  function animateCar() {
    counter += 0.001;

    counter %= 1;
    const p1 = curvePath.getPointAt(counter);
    const p2 = curvePath.getPointAt((counter + 0.01) % 1);

    car.position.set(p1.x, p1.y, p1.z);
    car.lookAt(p2.x, p2.y, p2.z);

    const p3 = curvePath.getPointAt((counter - 0.01 + 1) % 1);
    if (
      ((p3.x > p1.x && p2.x > p1.x) || (p3.x < p1.x && p2.x < p1.x)) &&
      Math.abs(p2.y - p3.y) > 2
    ) {
      if (!rotateTwice) {
        console.log('a');
        mustRotate = !mustRotate;
        rotateTwice = true;
      }
    } else rotateTwice = false;

    if (mustRotate) {
      car.rotateX(-Math.PI);
      car.rotateY(Math.PI);
    }
  }

  function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    controls.update();
    animateCar();
  }

  animate();

  camera.position.x = 0;
  camera.position.y = 20;
  camera.position.z = -25;
}

main();
