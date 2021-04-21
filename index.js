import { randomBoard, next, printBoard } from './conway.js';


function drawChanged(context, cellSize, cellColor, { board, old, indexes }) {
  for (let i = 0; i < board.length; i++) {
    if ((board[i] & 1) !== (old[i] & 1)) {
      drawCell(context, cellSize, cellColor, indexes[i], board[i] & 1);
    }
  }
}

function drawCell(context, cellSize, cellColor, [x, y], value) {
  if (value) {
    context.fillStyle = cellColor;
    context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  } else {
    context.clearRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }
}

function draw(context, cellSize, cellColor, board) {
  if (board.old) {
    drawChanged(context, cellSize, cellColor, board);
  } else {
    board.board.forEach(function (cell, index) {
      drawCell(context, cellSize, cellColor, board.indexes[index], cell & 1);
    });
  }
}

let animator = -1;
export function run(canvas, cellSize, speed) {
  cancelAnimationFrame(animator);
  const { clientWidth: canvasSize } = canvas;
  const size = canvasSize / cellSize;
  const context = canvas.getContext('2d', { alpha: false });
  const cellColor = getComputedStyle(document.body).getPropertyValue('--c-cell');
  let board = randomBoard(size);
  draw(context, cellSize, cellColor, board);
  const millisecondsPerGeneration = 1000 / speed;

  let lastRun = 0;
  function step(time) {
    if (!lastRun || (time - lastRun >= millisecondsPerGeneration)) {
      try {
        board = next(board);
        draw(context, cellSize, cellColor, board);
        lastRun = time;
      } catch (e) {
        console.error(e);
        return;
      }
    }
    animator = requestAnimationFrame(step);
  };

  animator = requestAnimationFrame(step);
}

export function stop(canvas) {
  cancelAnimationFrame(animator);
  const { clientWidth: canvasSize } = canvas;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvasSize, canvasSize);
}
