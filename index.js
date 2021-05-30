import * as Canvas from './canvas.js';


let worker = new Worker('./worker.js');

let animator = -1;
export function run({ canvas, previewCanvas, size, speed, color, probability }) {
  cancelAnimationFrame(animator);
  setTimeout(function () {
    runInternal({
      canvas,
      previewCanvas,
      color,
      size,
      speed,
      probability
    });
  }, 0);
}


export function stop(canvas) {
  cancelAnimationFrame(animator);
  Canvas.clear(canvas);
}


export function test() {
  worker.postMessage({
    request: 'test'
  });
}


function runInternal({ canvas, size, color, speed, probability }) {
  const canvasOptions = Canvas.getOptions(canvas, size);
  Canvas.clear(canvasOptions);
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
      color,
      board: data.board,
      speed
    });
  };
}


function prepRun({ canvasOptions, color, board, speed }) {
  let frameFunction =
    speed > 1 ? stepMultiGeneration
      : speed < 1 ? stepPartialGeneration
        : stepOnePerFrame;
  let runFrame = frameFunction({
    canvasOptions,
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


function stepOnePerFrame(options) {
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
    options.board = {
      buffer: canvasBuf,
      size: board.size
    };
    Canvas.draw(options);
  };
}


function stepMultiGeneration(options) {
  return function (board) {
    if (!board.buffer.byteLength) { return; }
    const canvasBuf = board.buffer.slice(0);
    worker.postMessage({
      request: 'next',
      params: {
        board,
        generations: options.speed
      }
    }, [
      board.buffer
    ]);
    options.board = {
      buffer: canvasBuf,
      size: board.size
    };
    Canvas.draw(options);
  };
}

function stepPartialGeneration(options) {
  const speed = Math.round(1 / options.speed);
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
    options.board = {
      buffer: canvasBuf,
      size: board.size
    };
    Canvas.draw(options);
    speedTimer--;
  };
}
