import './three.js';


export function getOptions(canvas) {
  const { width: canvasSize } = canvas;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false
  });
  renderer.setSize(canvasSize, canvasSize);
  renderer.autoClear = true;
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = function () {
    return new THREE.Mesh(geometry, material);
  };
  const distance = 100;
  camera.position.z = distance;
  camera.position.y = distance;
  camera.position.x = distance;
  camera.rotation.x = -0.75;
  camera.rotation.y = 0.65;
  camera.rotation.z = 0.5;
  return {
    canvasSize,
    scene,
    camera,
    renderer,
    cube
  };
}


export function clear(canvas) {
}


export function draw({ canvasOptions, cellSize, color, board }) {
  canvasOptions.scene.remove.apply(canvasOptions.scene, canvasOptions.scene.children);
  for (let z = 0; z < board.size; z++) {
    for (let y = 0; y < board.size; y++) {
      for (let x = 0; x < board.size; x++) {
        const index = x + y * board.size + z * board.size * board.size;
        const cell = board.board[index] & 1;
        if (cell) {
          const cube = canvasOptions.cube();
          cube.position.x = x;
          cube.position.y = y;
          cube.position.z = z;
          canvasOptions.scene.add(cube);
        }
      }
    }
  }
  canvasOptions.renderer.render(canvasOptions.scene, canvasOptions.camera);
}

