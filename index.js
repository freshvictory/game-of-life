import * as Canvas from "./canvas.js";

/**
 * @typedef { import("./canvas.js").CanvasOptions } CanvasOptions
 */

let worker = new Worker("./worker.js");

let animator = -1;

/** @type {Board | undefined} */
let lastBoard;

/**
 * Creates a new board and runs the simulation.
 * @param {{
 *  canvas: HTMLCanvasElement,
 *  size: number,
 *  speed: number,
 *  color: [number, number, number],
 *  probability: number
 * }} _
 */
export function run({ canvas, size, speed, color, probability }) {
  cancelAnimationFrame(animator);
  setTimeout(function () {
    runInternal({
      canvas,
      color,
      size,
      speed,
      probability,
    });
  }, 0);
}

/**
 * Continues playing the simulation from the current board.
 *
 * @param {{
 *  canvas: HTMLCanvasElement,
 *  speed: number,
 *  color: [number, number, number]
 * }} _
 */
export function play({ canvas, speed, color }) {
  cancelAnimationFrame(animator);
  setTimeout(function () {
    if (!lastBoard) {
      return;
    }

    prepRun({
      canvasOptions: Canvas.getOptions(canvas, lastBoard.size),
      board: lastBoard,
      color,
      speed,
    });
  });
}

/**
 * @param {{
 *  canvas: HTMLCanvasElement,
 *  color: [number, number, number]
 * }} _
 */
export function step({ canvas, color }) {
  cancelAnimationFrame(animator);
  setTimeout(function () {
    if (!lastBoard) {
      return;
    }

    stepOnePerFrame({
      canvasOptions: Canvas.getOptions(canvas, lastBoard.size),
      color,
    })(lastBoard);
  }, 0);
}

/**
 * Pause the simulation.
 */
export function pause() {
  cancelAnimationFrame(animator);
}

/**
 * Stop the simulation.
 *
 * @param {HTMLCanvasElement} canvas
 */
export function stop(canvas) {
  cancelAnimationFrame(animator);
  lastBoard = undefined;
  Canvas.clear(canvas);
}

export function test() {
  worker.postMessage({
    request: "test",
  });
}

/**
 *
 * @param {{
 *  canvas: HTMLCanvasElement,
 *  size: number,
 *  speed: number,
 *  color: [number, number, number],
 *  probability: number
 * }} _
 */
function runInternal({ canvas, size, color, speed, probability }) {
  const canvasOptions = Canvas.getOptions(canvas, size);
  Canvas.clear(canvasOptions);
  worker.postMessage({
    request: "random",
    params: {
      size,
      probability,
    },
  });
  worker.onmessage = function ({ data }) {
    lastBoard = data.board;
    prepRun({
      canvasOptions,
      color,
      board: data.board,
      speed,
    });
  };
}

/**
 * @param {{
 *  canvasOptions: CanvasOptions,
 *  speed: number,
 *  color: [number, number, number],
 *  board: Board
 * }} _
 */
function prepRun({ canvasOptions, color, board, speed }) {
  let frameFunction =
    speed > 1
      ? stepMultiGeneration
      : speed < 1
      ? stepPartialGeneration
      : stepOnePerFrame;
  let runFrame = frameFunction({
    canvasOptions,
    color,
    speed,
  });
  worker.onmessage = function ({ data }) {
    lastBoard = data.board;
    board = data.board;
  };
  function step() {
    runFrame(board);
    animator = requestAnimationFrame(step);
  }
  animator = requestAnimationFrame(step);
}

/**
 *
 * @param {{
 *  canvasOptions: CanvasOptions,
 *  color: [number, number, number],
 *  board?: Board
 * }} options
 * @returns {(board: Board) => void}
 */
function stepOnePerFrame(options) {
  return function (board) {
    if (!board.buffer.byteLength) {
      return;
    }
    const canvasBuf = board.buffer.slice(0);
    worker.postMessage(
      {
        request: "next",
        params: {
          board,
          generations: 1,
        },
      },
      [board.buffer]
    );
    options.board = {
      buffer: canvasBuf,
      size: board.size,
    };
    Canvas.draw(options);
  };
}

function stepMultiGeneration(options) {
  return function (board) {
    if (!board.buffer.byteLength) {
      return;
    }
    const canvasBuf = board.buffer.slice(0);
    worker.postMessage(
      {
        request: "next",
        params: {
          board,
          generations: options.speed,
        },
      },
      [board.buffer]
    );
    options.board = {
      buffer: canvasBuf,
      size: board.size,
    };
    Canvas.draw(options);
  };
}

function stepPartialGeneration(options) {
  const speed = Math.round(1 / options.speed);
  let speedTimer = speed;
  return function (board) {
    if (!board.buffer.byteLength) {
      return;
    }
    const canvasBuf = board.buffer.slice(0);
    if (speedTimer < 1) {
      worker.postMessage(
        {
          request: "next",
          params: {
            board,
            generations: 1,
          },
        },
        [board.buffer]
      );
      speedTimer = speed;
    }
    options.board = {
      buffer: canvasBuf,
      size: board.size,
    };
    Canvas.draw(options);
    speedTimer--;
  };
}
