import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as views from './views';
import car from './car';
import { TextureLoader } from 'three';

if (import.meta.env.PROD) {
  // Ignorar todos os console.log no build final
  console.log = () => {
    /* ignore */
  };
}

const scene = new THREE.Scene();

const loader = new OBJLoader();
const textureLoader = new THREE.TextureLoader();
const cubeLoader = new THREE.CubeTextureLoader();

async function main() {
  // Primeiro, esperamos que todos os objetos sejam carregados
  const [curvePath, curveLine, backgroundCube, sandTexture] = await Promise.all(
    [
      loader.loadAsync('/roller-coaster-curve.obj').then((object) => {
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
      loader.loadAsync('/roller-coaster.obj').then((object) => {
        console.log(object);
        const curveGeometry = object.children[0].geometry;
        const material = new THREE.LineBasicMaterial({
          color: 0xff7f00,
          linewidth: 1,
        });

        return new THREE.Line(curveGeometry, material);
      }),
      cubeLoader.loadAsync([
        '/background_right.png',
        '/background_left.png',
        '/background_up.png',
        '/background_down.png',
        '/background_front.png',
        '/background_back.png',
      ]),
      textureLoader.loadAsync('/background_down.png'),
    ]
  );

  document.getElementById('loading').remove();
  document.getElementById('instructions').classList.remove('hidden');

  const canvas = document.querySelector('canvas');

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
    alpha: true,
  });

  const view = (() => {
    const loadedViews = {
      car: new views.CarView(car),
      global: new views.GlobalView(scene),
      drone: new views.DroneView(scene, car),
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

        updateViewport();

        return current;
      },
    };
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
  } else {
    window.addEventListener('resize', updateViewport);
  }

  console.log(car);
  car.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.envMap = backgroundCube;
      child.needsUpdate = true;
    }
  });

  const geometry = new THREE.PlaneGeometry(1000, 1000);
  const material = new THREE.MeshBasicMaterial({
    map: sandTexture,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX((3 * Math.PI) / 2);
  scene.add(plane);

  scene.add(plane);
  scene.add(car);
  scene.add(curveLine);
  scene.background = backgroundCube;

  let counter = 0;

  let speed = 0.0015;

  const energy = speed ** 2 / 2;

  const maxHeight = 14.52;
  const speedAtTheTop = speed / 3;

  // Escolhemos o valor da gravidade a dedo para que a velocidade no ponto
  // mais alto da pista seja a que desejamos :)
  const gravity = (energy - speedAtTheTop ** 2 / 2) / maxHeight;

  function animateCar() {
    counter += speed;
    counter %= 1;

    // counter ~ 0 (faixa de tolerância de meio passo)
    if (counter >= 1 - speed / 2 || counter <= speed / 2) {
      // Reset da rotação do carrinho para correção de erros numéricos
      car.rotation.set(0, 0, 0);
    }

    const newPos = curvePath.getPointAt(counter);
    const pointInFront = curvePath.getPointAt((counter + 0.005) % 1);

    car.position.copy(newPos);

    const oldDir = new THREE.Vector3();
    const newDir = new THREE.Vector3();

    car.getWorldDirection(oldDir);
    newDir.subVectors(pointInFront, car.position).normalize();

    const theta = Math.acos(newDir.dot(oldDir));

    const axis = new THREE.Vector3().crossVectors(oldDir, newDir).normalize();

    car.rotateOnWorldAxis(axis, theta);

    const height = car.position.y;

    speed = Math.sqrt(2 * (energy - gravity * height));
  }

  function animate() {
    const currentView = view.get();

    renderer.render(scene, currentView.camera);
    requestAnimationFrame(animate);
    animateCar();
    currentView.update();
  }

  const isTouch = 'ontouchstart' in window;

  if (isTouch) {
    const instructions = document.getElementById('instructions');
    instructions.innerHTML = '<h3>Câmeras</h3>';

    instructions.style.width = '110pt';

    const elements = [
      ['global', 'Global'],
      ['car', 'Carro'],
      ['drone', 'Drone'],
    ].map(([id, name]) => {
      const div = document.createElement('div');

      const span = document.createElement('span');
      span.innerText = name;
      span.style.marginRight = '.6rem';

      const button = document.createElement('button');
      button.addEventListener('click', () => view.set(id));
      button.innerText = '\xa0';

      div.style.textAlign = 'center';

      div.append(span, button);

      return div;
    });

    instructions.append(...elements);
  } else {
    window.addEventListener('keypress', (e) => {
      switch (e.key) {
        case '1':
          return view.set('global');
        case '2':
          return view.set('car');
        case '3':
          return view.set('drone');
      }
    });
  }

  animate();
}

main();
