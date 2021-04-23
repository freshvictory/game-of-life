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
  let updateBoard;
  if (speed > 1) {
    updateBoard = function () {
      Canvas.draw({
        canvasOptions,
        cellSize,
        color,
        board
      });
      for (let i = 0; i < speed; i++) {
        board = Conway.next(board);
      }
    };
  } else if (speed < 1) {
    speed = Math.round(1 / speed);
    let speedTimer = speed;
    updateBoard = function () {
      if (speedTimer < 1) {
        Canvas.draw({
          canvasOptions,
          cellSize,
          color,
          board
        });
        board = Conway.next(board);
        console.log(board);
        speedTimer = speed;
      }
      speedTimer--;
    };
  } else {
    updateBoard = function () {
      Canvas.draw({
        canvasOptions,
        cellSize,
        color,
        board
      });
      board = Conway.next(board);
    };
  }
  function step() {
    updateBoard();
    animator = requestAnimationFrame(step);
  };
  // Without this wrapper, things seem to get out of sync
  // and Chrome shows every frame being dropped.
  // Might be a red herring.
  setTimeout(function () {
    animator = requestAnimationFrame(step);
  });
}
