import init from "./wasm.js";

const Module = await init();

/**
 * @typedef {{ size: number, buffer: ArrayBuffer }} Board
 */

class ConwayC {
  constructor(module) {
    this.fromBoard = module.cwrap("fromBoard", null, [
      "number",
      "array",
      "number",
    ]);

    this.next = module.cwrap("next", null, [
      "number",
      "array",
      "number",
      "number",
    ]);
  }
}

const conwayC = new ConwayC(Module);

export const Conway = {
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
    conwayC.fromBoard(size, board, buf);
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
    conwayC.next(size, new Uint8Array(board), generations, buf);
    const array = Module.HEAPU8.slice(buf, buf + size * size);
    Module._free(buf);
    return {
      size,
      buffer: array.buffer,
    };
  },
};
