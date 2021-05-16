// import * as Canvas from './canvas.js';
import * as Canvas from './canvas3.js';
// import * as Conway from './conway.js';
import * as Conway from './conway3.js';


let animator = -1;
export function run({ canvas, previewCanvas, cellSize, speed, color, probability }) {
  cancelAnimationFrame(animator);
  setTimeout(function () {
    runInternal({
      canvas,
      previewCanvas,
      color,
      cellSize,
      speed,
      probability,
      initialBoard: undefined
    });
  }, 0);
}


export function stop(canvas) {
  cancelAnimationFrame(animator);
  Canvas.clear(canvas);
}


let previewCoordinates = {};
export function preview(canvas, previewCanvas) {
  const min = previewCanvas.width / 2;
  const max = canvas.width - (previewCanvas.width / 2);
  function mouseMove(evt) {
    previewCoordinates = {
      x: Math.min(Math.max(evt.layerX, min), max),
      y: Math.min(Math.max(evt.layerY, min), max)
    };
  };

  function mouseLeave() {
    delete previewCoordinates.x;
    previewCanvas.getContext('2d').clearRect(0, 0, previewCanvas.width, previewCanvas.width);
    document.body.classList.remove('previewing');
  };

  function mouseEnter() {
    document.body.classList.add('previewing');
  }

  canvas.addEventListener('mouseenter', mouseEnter);
  canvas.addEventListener('mousemove', mouseMove);
  canvas.addEventListener('mouseleave', mouseLeave);
}


function runInternal({ canvas, previewCanvas, cellSize, color, initialBoard, speed, probability }) {
  const canvasOptions = Canvas.getOptions(canvas);
  const previewOptions = previewCanvas ? Canvas.getOptions(previewCanvas) : null;
  const size = canvasOptions.canvasSize / cellSize;
  Canvas.clear(canvas);
  if (previewCanvas) {
    Canvas.clear(previewCanvas);
  }
  initialBoard = initialBoard || Conway.random(size, probability);
  let board = Conway.fromBoard(initialBoard, size);
  setTimeout(function () {
    prepRun({
      canvasOptions,
      previewOptions,
      cellSize,
      color,
      board,
      speed
    });
  });
}


function prepRun({ canvasOptions, previewOptions, cellSize, color, board, speed }) {
  let first = precomputeBoard(board, 10);
  let frameFunction =
    speed > 1 ? stepMultiGeneration
      : speed < 1 ? stepPartialGeneration
        : stepOnePerFrame;
  let runFrame = frameFunction({
    canvasOptions,
    previewOptions,
    board,
    cellSize,
    color,
    first,
    speed
  });
  function step() {
    runFrame();
    animator = requestAnimationFrame(step);
  };
  animator = requestAnimationFrame(step);
}


function precomputeBoard(board, n) {
  // Precompute the first few boards, since those
  // usually have the most change
  let first = new Array(n);
  first[0] = Conway.next(board);
  for (let i = 1; i < first.length; i++) {
    first[i] = Conway.next(first[i - 1]);
  }
  return first;
}


function stepOnePerFrame({
  canvasOptions,
  previewOptions,
  board,
  cellSize,
  color,
  first
}) {
  let generationTotal = 0;
  return function () {
    Canvas.draw({
      canvasOptions,
      previewOptions,
      previewCoordinates,
      cellSize,
      color,
      board
    });
    if (generationTotal < first.length) {
      generationTotal++;
      board = first[generationTotal - 1];
    } else {
      board = Conway.next(board);
    }
  };
}


function stepMultiGeneration({
  canvasOptions,
  previewOptions,
  board,
  cellSize,
  color,
  first,
  speed
}) {
  let generationTotal = 0;
  return function () {
    Canvas.draw({
      canvasOptions,
      previewOptions,
      previewCoordinates,
      cellSize,
      color,
      board
    });
    for (let i = 0; i < speed; i++) {
      if (generationTotal < first.length) {
        generationTotal++;
        board = first[generationTotal - 1];
      } else {
        board = Conway.next(board);
      }
    }
  };
}

function stepPartialGeneration({
  canvasOptions,
  previewOptions,
  board,
  cellSize,
  color,
  first,
  speed
}) {
  let generationTotal = 0;
  speed = Math.round(1 / speed);
  let speedTimer = speed;
  return function () {
    if (speedTimer < 1) {
      Canvas.draw({
        canvasOptions,
        previewOptions,
        previewCoordinates,
        cellSize,
        color,
        board
      });
      if (generationTotal < first.length) {
        generationTotal++;
        board = first[generationTotal - 1];
      } else {
        board = Conway.next(board);
      }
      speedTimer = speed;
    }
    speedTimer--;
  };
}
