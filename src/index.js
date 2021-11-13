import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import car from './car';

const canvas = document.querySelector('canvas');

const scene = new THREE.Scene();
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

let controls = new OrbitControls(camera, renderer.domElement);

let plane = new THREE.GridHelper(60, 10);
scene.add(plane);

const loader = new OBJLoader();
let curvePath = undefined;

loader.load(
  '/roller-coaster-curve.obj',
  // called when resource is loaded
  function (object) {
    let curveGeometry = object.children[0].geometry;
    console.log(curveGeometry);
    const coordinates = curveGeometry.getAttribute('position');
    console.log(coordinates);
    let points = [];

    for (let i = 0; i < 3 * coordinates.count; i += 3) {
      points.push(
        new THREE.Vector3(
          coordinates.array[i],
          coordinates.array[i + 1],
          coordinates.array[i + 2]
        )
      );
    }
    curvePath = new THREE.CatmullRomCurve3(points);
  }
);

loader.load(
  '/roller-coaster.obj',
  // called when resource is loaded
  function (object) {
    let curveGeometry = object.children[0].geometry;
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const line = new THREE.Line(curveGeometry, material);
    scene.add(line);
  }
);

let counter = 0;
scene.add(car);
let mustRotate = false;
let rotateTwice = false;

function animateCar() {
  if (curvePath) {
    counter += 0.001;

    counter %= 1;
    let p1 = curvePath.getPointAt(counter);
    let p2 = curvePath.getPointAt((counter + 0.01) % 1);

    car.position.set(p1.x, p1.y, p1.z);
    car.lookAt(p2.x, p2.y, p2.z);

    let p3 = curvePath.getPointAt((counter - 0.01 + 1) % 1);
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
