import * as THREE from 'three';

// criação do grupo que será futuramente um carrinho
const car = new THREE.Group();
const material = new THREE.MeshPhongMaterial({
  color: 0x3366ff,
  wireframe: false
});
const material2 = new THREE.MeshPhongMaterial({
  color: 0x00b300,
  wireframe: false
});

// rodas
const wheelGeometry = new THREE.TorusGeometry(1 / 7, 1 / 6, 16, 100);
const baseWheel = new THREE.Mesh(wheelGeometry, material2);
baseWheel.rotateY((90 * Math.PI) / 180);
baseWheel.translateY(1 / 7 + 1 / 6);

const wheelPositions = [
  [1 - 1 / 3, -0.55 + 1 / 6],
  [1 - 1 / 3, 0.55 - 1 / 6],
  [-1 + 1 / 3, -0.55 + 1 / 6],
  [-1 + 1 / 3, 0.55 - 1 / 6]
];

/**@type {THREE.Mesh[]} */
const wheels = [];

for (const pos of wheelPositions) {
  const wheel = baseWheel.clone();
  wheel.translateX(pos[0]);
  wheel.translateZ(pos[1]);
  wheels.push(wheel);
  car.add(wheel);
}

// parte superior do carro (paralelepípedo)
const upGeometry = new THREE.BoxGeometry(1, 0.4, 0.6);
const cubeUp = new THREE.Mesh(upGeometry, material);
cubeUp.position.y = 1 / 6 + 1 / 7 + 0.8;
cubeUp.position.z = -0.3;
car.add(cubeUp);

// parte inferior do carro (paralelepípedo)
const downGeometry = new THREE.BoxGeometry(1, 0.6, 2);
const cubeDown = new THREE.Mesh(downGeometry, material);
cubeDown.position.y = 1 / 6 + 1 / 7 + 0.3;
car.add(cubeDown);

// estrutura auxiliar (1/4 de cilindro) para o carro
// ficar com arestas mais arredondadas
const cilynderGeometry = new THREE.CylinderGeometry(
  0.4,
  0.4,
  1,
  32,
  32,
  false,
  0,
  Math.PI / 2
);
const auxGeo = new THREE.Mesh(cilynderGeometry, material);
auxGeo.rotateZ(Math.PI / 2);
auxGeo.translateX(1 / 6 + 1 / 7 + 0.6);
car.add(auxGeo);

const auxGeo2 = auxGeo.clone();
auxGeo2.rotateX(Math.PI);
auxGeo2.translateZ(0.6);
car.add(auxGeo2);

export default car;
