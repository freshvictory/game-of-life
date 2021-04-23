import * as Canvas from './canvas.js';
import * as Conway from './Conway.js';


let animator = -1;
export function run({ canvas, cellSize, speed, color, probability }) {
  cancelAnimationFrame(animator);
  setTimeout(function () {
    runInternal({
      canvas,
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
  const canvasOptions = Canvas.getOptions(canvas);
  Canvas.clear(canvasOptions);
}


function runInternal({ canvas, cellSize, color, initialBoard, speed, probability }) {
  const canvasOptions = Canvas.getOptions(canvas);
  const size = canvasOptions.canvasSize / cellSize;
  Canvas.clear(canvasOptions);
  initialBoard = initialBoard || Conway.random(size, probability);
  let board = Conway.fromBoard(initialBoard, size);
  setTimeout(function () {
    prepRun({
      canvasOptions,
      cellSize,
      color,
      board,
      speed
    });
  });
}


function prepRun({ canvasOptions, cellSize, color, board, speed }) {
  let first = precomputeBoard(board, 10);
  let frameFunction =
    speed > 1 ? stepMultiGeneration
      : speed < 1 ? stepPartialGeneration
        : stepOnePerFrame;
  let runFrame = frameFunction({
    canvasOptions,
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
  board,
  cellSize,
  color,
  first
}) {
  let generationTotal = 0;
  return function () {
    Canvas.draw({
      canvasOptions,
      cellSize,
      color,
      board
    });
    generationTotal++;
    if (generationTotal < first.length) {
      board = first[generationTotal - 1];
    } else {
      board = Conway.next(board);
    }
  };
}


function stepMultiGeneration({
  canvasOptions,
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
      cellSize,
      color,
      board
    });
    for (let i = 0; i < speed; i++) {
      generationTotal++;
      if (generationTotal < first.length) {
        board = first[generationTotal - 1];
      } else {
        board = Conway.next(board);
      }
    }
  };
}

function stepPartialGeneration({
  canvasOptions,
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
        cellSize,
        color,
        board
      });
      generationTotal++;
      if (generationTotal <= first.length) {
        board = first[generationTotal - 1];
      } else {
        board = Conway.next(board);
      }
      speedTimer = speed;
    }
    speedTimer--;
  };
}
