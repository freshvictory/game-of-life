importScripts('./wasm.js');

const ConwayC = {
  build() {
    ConwayC.fromBoard = Module.cwrap(
      'fromBoard',
      null,
      ['number', 'array', 'number']
    );

    ConwayC.next = Module.cwrap(
      'next',
      null,
      ['number', 'array', 'number', 'number']
    );
  }
};

Module.onRuntimeInitialized = function () {
  ConwayC.build();
}

const Conway = {
  random(size, probability) {
    const buffer = new ArrayBuffer(size * size);
    const board = new Uint8Array(buffer);
    for (let i = 0; i < size * size; i++) {
      board[i] = (Math.random() < probability) ? 1 : 0;
    }
    return board;
  },


  fromBoard(size, board) {
    const buf = Module._malloc(size * size);
    ConwayC.fromBoard(size, board, buf);
    const array = Module.HEAPU8.slice(buf, buf + size * size);
    Module._free(buf);
    return {
      size,
      buffer: array.buffer
    };
  },


  next(size, board, generations) {
    const buf = Module._malloc(size * size);
    ConwayC.next(size, new Uint8Array(board), generations, buf);
    const array = Module.HEAPU8.slice(buf, buf + size * size);
    Module._free(buf);
    return {
      size,
      buffer: array.buffer
    };
  }
};
