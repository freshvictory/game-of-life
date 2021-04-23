function computeNeighborIndexes(size) {
  const array = new Array(size * size);
  let left = 0, right = 0, top = 0, bottom = 0;
  let index = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      index = x + y * size;
      left = x === 0 ? size - 1 : -1;
      right = x === size - 1 ? -size + 1 : 1;
      top = y === 0 ? size * (size - 1) : -size;
      bottom = y === size - 1 ? -size * (size - 1) : size;
      array[index] = [
        index + top + left,
        index + top,
        index + top + right,
        index + left,
        index + right,
        index + bottom + left,
        index + bottom,
        index + bottom + right
      ];
    }
  }
  return array;
}


export function random(size, probability) {
  const board = new Array(size);
  for (let i = 0; i < size; i++) {
    board[i] = new Array(size);
    for (let j = 0; j < size; j++) {
      board[i][j] = (Math.random() < probability) ? 1 : 0;
    }
  }
  return board;
}


export function randomBoard(size) {
  return fromBoard(random(size), size);
}


export function fromBoard(board, size) {
  const neighborIndexes = computeNeighborIndexes(size);
  const buffer = new ArrayBuffer(size * size);
  const array = new Uint8Array(buffer);
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board.length; x++) {
      const index = x + y * size;
      const isAlive = !!board[y][x];
      array[index] += isAlive ? 1 : 0;
      for (const neighborIndex of neighborIndexes[index]) {
        array[neighborIndex] += isAlive ? 2 : 0;
      }
    }
  }
  return {
    board: array,
    size,
    neighborIndexes
  };
}


export function printBoard({ board, size }) {
  let str = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = x + y * size;
      str.push('(' + index + ':' + (board[index] & 1));
      str.push(' neighbors: ' + ((board[index] & 30) >> 1) + ') ');
    }
    str.push('\n');
  }
  return str.join('');
}


// Byte-based implementation adapted from
// http://www.jagregory.com/abrash-black-book/#chapter-17-the-game-of-life
export function next(options) {
  const newBuffer = options.board.buffer.slice(0);
  const newBoard = new Uint8Array(newBuffer);
  for (let i = 0; i < options.board.length; i++) {
    const cell = options.board[i];
    const aliveNow = cell & 1;
    const neighbors = (cell & 30) >> 1;
    const isAliveNext = neighbors === 3 || (!!aliveNow && neighbors === 2);
    const aliveNext = isAliveNext ? 1 : 0;
    const newNeighbors = (newBoard[i] & 30) >> 1;
    newBoard[i] = (newNeighbors << 1) + aliveNext;
    if (aliveNext !== aliveNow) {
      for (const neighborIndex of options.neighborIndexes[i]) {
        newBoard[neighborIndex] += isAliveNext ? 2 : -2;
      }
    }
  }
  options.board = newBoard;
  return options;
}
