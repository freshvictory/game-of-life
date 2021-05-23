import * as Canvas from './canvas.js';


let worker = new Worker('./worker.js');

let animator = -1;
export function run({ canvas, previewCanvas, cellSize, speed, color, probability }) {
  worker = new Worker('./worker.js');
  cancelAnimationFrame(animator);
  setTimeout(function () {
    runInternal({
      canvas,
      previewCanvas,
      color,
      cellSize,
      speed,
      probability
    });
  }, 0);
}


export function stop(canvas) {
  worker.terminate();
  cancelAnimationFrame(animator);
  Canvas.clear(canvas);
}


export function test() {
  worker = new Worker('./worker.js');
  worker.postMessage({
    request: 'test'
  });
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


function runInternal({ canvas, previewCanvas, cellSize, color, speed, probability }) {
  const canvasOptions = Canvas.getOptions(canvas);
  const previewOptions = Canvas.getOptions(previewCanvas);
  const size = canvasOptions.canvasSize / cellSize;
  Canvas.clear(canvas);
  Canvas.clear(previewCanvas);
  worker.postMessage({
    request: 'random',
    params: {
      size,
      probability
    }
  });
  worker.onmessage = function ({ data }) {
    prepRun({
      canvasOptions,
      previewOptions,
      cellSize,
      color,
      board: data.board,
      speed
    });
  };
}


function prepRun({ canvasOptions, previewOptions, cellSize, color, board, speed }) {
  let frameFunction =
    speed > 1 ? stepMultiGeneration
      : speed < 1 ? stepPartialGeneration
        : stepOnePerFrame;
  let runFrame = frameFunction({
    canvasOptions,
    previewOptions,
    cellSize,
    color,
    speed
  });
  worker.onmessage = function ({ data }) {
    board = data.board;
  };
  function step() {
    runFrame(board);
    animator = requestAnimationFrame(step);
  };
  animator = requestAnimationFrame(step);
}


function stepOnePerFrame({
  canvasOptions,
  previewOptions,
  cellSize,
  color
}) {
  return function (board) {
    if (!board.buffer.byteLength) { return; }
    const canvasBuf = board.buffer.slice(0);
    worker.postMessage({
      request: 'next',
      params: {
        board,
        generations: 1
      }
    }, [
      board.buffer
    ]);
    Canvas.draw({
      canvasOptions,
      previewOptions,
      previewCoordinates,
      cellSize,
      color,
      board: {
        buffer: canvasBuf,
        size: board.size
      }
    });
  };
}


function stepMultiGeneration({
  canvasOptions,
  previewOptions,
  cellSize,
  color,
  speed
}) {
  return function (board) {
    if (!board.buffer.byteLength) { return; }
    const canvasBuf = board.buffer.slice(0);
    worker.postMessage({
      request: 'next',
      params: {
        board,
        generations: speed
      }
    }, [
      board.buffer
    ]);
    Canvas.draw({
      canvasOptions,
      previewOptions,
      previewCoordinates,
      cellSize,
      color,
      board: {
        buffer: canvasBuf,
        size: board.size
      }
    });
  };
}

function stepPartialGeneration({
  canvasOptions,
  previewOptions,
  cellSize,
  color,
  speed
}) {
  speed = Math.round(1 / speed);
  let speedTimer = speed;
  return function (board) {
    if (!board.buffer.byteLength) { return; }
    const canvasBuf = board.buffer.slice(0);
    if (speedTimer < 1) {
      worker.postMessage({
        request: 'next',
        params: {
          board,
          generations: 1
        }
      }, [
        board.buffer
      ]);
      speedTimer = speed;
    }
    Canvas.draw({
      canvasOptions,
      previewOptions,
      previewCoordinates,
      cellSize,
      color,
      board: {
        buffer: canvasBuf,
        size: board.size
      }
    });
    speedTimer--;
  };
}
