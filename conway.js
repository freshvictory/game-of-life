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
  const buffer = new ArrayBuffer(size * size);
  const array = new Uint8Array(buffer);
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board.length; x++) {
      const index = x + y * size;
      const isAlive = !!board[y][x];
      array[index] += isAlive ? 1 : 0;
      const change = isAlive ? 2 : 0;
      setNeighbors(array, size, x, y, index, change);
    }
  }
  return {
    board: array,
    size
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

const changed = [
  0,  // Dead, no neighbors
  -1, // Alive, no neighbors -- dies
  0,  // Dead, one neighbor
  -1, // Alive, one neighbor -- dies
  0,  // Dead, two neighbors
  0,  // Alive, two neighbors
  1,  // Dead, three neighbors -- born
  0,  // Alive, three neighbors
  0,  // Dead, four neighbors
  -1,
  0,
  -1,
  0,
  -1,
  0,
  -1,
  0,
  -1
];


// Byte-based implementation adapted from
// http://www.jagregory.com/abrash-black-book/#chapter-17-the-game-of-life
export function next(options) {
  const newBuffer = options.board.buffer.slice(0);
  const newBoard = new Uint8Array(newBuffer);
  for (let y = 0; y < options.size; y++) {
    for (let x = 0; x < options.size; x++) {
      const index = x + y * options.size;
      const cell = options.board[index];
      if (changed[cell]) {
        newBoard[index] = newBoard[index] + changed[cell];
        setNeighbors(newBoard, options.size, x, y, index, changed[cell] * 2);
      }
    }
  }
  return {
    board: newBoard,
    size: options.size
  };
}


function setNeighbors(board, size, x, y, index, change) {
  const left = x === 0 ? size - 1 : -1;
  const right = x === size - 1 ? -size + 1 : 1;
  const top = y === 0 ? size * (size - 1) : -size;
  const bottom = y === size - 1 ? -size * (size - 1) : size;
  board[index + top + left] += change;
  board[index + top] += change;
  board[index + top + right] += change;
  board[index + left] += change;
  board[index + right] += change;
  board[index + bottom + left] += change;
  board[index + bottom] += change;
  board[index + bottom + right] += change;
}
