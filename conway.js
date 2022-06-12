importScripts("./wasm.js");

/**
 * @typedef {{ size: number, buffer: ArrayBuffer }} Board
 */

const ConwayC = {
  build() {
    ConwayC.fromBoard = Module.cwrap("fromBoard", null, [
      "number",
      "array",
      "number",
    ]);

    ConwayC.next = Module.cwrap("next", null, [
      "number",
      "array",
      "number",
      "number",
    ]);
  },
};

Module.onRuntimeInitialized = function () {
  ConwayC.build();
};

const Conway = {
  /**
   * Creates a random board with given size
   * and cell life probability.
   *
   * @param {number} size
   * @param {number} probability
   * @returns {Uint8Array}
   */
  random(size, probability) {
    const buffer = new ArrayBuffer(size * size);
    const board = new Uint8Array(buffer);
    for (let i = 0; i < size * size; i++) {
      board[i] = Math.random() < probability ? 1 : 0;
    }
    return board;
  },

  /**
   * Given a size and a board array,
   * create a Board.
   *
   * @param {number} size
   * @param {Uint8Array} board
   * @returns {Board}
   */
  fromBoard(size, board) {
    const buf = Module._malloc(size * size);
    ConwayC.fromBoard(size, board, buf);
    const array = Module.HEAPU8.slice(buf, buf + size * size);
    Module._free(buf);
    return {
      size,
      buffer: array.buffer,
    };
  },

  /**
   * Simulate the next n generations of the given
   * board.
   *
   * @param {number} size
   * @param {Uint8Array} board
   * @param {number} generations
   * @returns {Board}
   */
  next(size, board, generations) {
    const buf = Module._malloc(size * size);
    ConwayC.next(size, new Uint8Array(board), generations, buf);
    const array = Module.HEAPU8.slice(buf, buf + size * size);
    Module._free(buf);
    return {
      size,
      buffer: array.buffer,
    };
  },
};
