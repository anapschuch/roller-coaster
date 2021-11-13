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
