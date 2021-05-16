export function random(size, probability) {
  const board = new Array(size);
  for (let i = 0; i < size; i++) {
    board[i] = new Array(size);
    for (let j = 0; j < size; j++) {
      board[i][j] = new Array(size);
      for (let k = 0; k < size; k++) {
        board[i][j][k] = (Math.random() < probability) ? 1 : 0;
      }
    }
  }
  return board;
}


export function fromBoard(board, size) {
  const buffer = new ArrayBuffer(size * size * size);
  const array = new Uint8Array(buffer);
  for (let z = 0; z < board.length; z++) {
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board.length; x++) {
        const index = x + y * size + z * size * size;
        const isAlive = !!board[z][y][x];
        array[index] += isAlive ? 1 : 0;
        const change = isAlive ? 2 : 0;
        setNeighbors(array, size, x, y, z, index, change);
      }
    }
  }
  return {
    board: array,
    size
  };
}


export function print(board) {
  let result = '\n';
  for (let z = 0; z < board.size; z++) {
    for (let y = 0; y < board.size; y++) {
      result += '[ ';
      for (let x = 0; x < board.size; x++) {
        const index = x + y * board.size + z * board.size * board.size;
        const cell = board.board[index];
        result += (cell & 1);
        result += (' (' + ((cell & 62) >> 1) + ') ');
      }
      result += '] ';
    }
    result += '\n';
  }
  return result;
}


export function next(options) {
  const newBuffer = options.board.buffer.slice(0);
  const newBoard = new Uint8Array(newBuffer);
  for (let z = 0; z < options.size; z++) {
    for (let y = 0; y < options.size; y++) {
      for (let x = 0; x < options.size; x++) {
        const index = x + y * options.size + z * options.size * options.size;
        const cell = options.board[index];
        if (cell !== 0) {
          const aliveNow = cell & 1;
          const neighbors = (cell & 62) >> 1;
          const isAliveNext = (!aliveNow && neighbors === 5)
            || (!!aliveNow && (neighbors === 5 || neighbors === 4));
          const aliveNext = isAliveNext ? 1 : 0;
          newBoard[index] = (newBoard[index] & 62) + aliveNext;
          if (aliveNext !== aliveNow) {
            setNeighbors(newBoard, options.size, x, y, z, index, isAliveNext ? 2 : -2);
          }
        }
      }
    }
  }
  return {
    board: newBoard,
    size: options.size
  };
}


function setNeighbors(board, size, x, y, z, index, change) {
  const left = x === 0 ? size - 1 : -1;
  const right = x === size - 1 ? -size + 1 : 1;
  const top = y === 0 ? size * (size - 1) : -size;
  const bottom = y === size - 1 ? -size * (size - 1) : size;
  const forward = z === 0 ? size * size * (size - 1) : -(size * size);
  const backward = z === size - 1 ? size * size * (1 - size) : size * size;
  board[index + top + left] += change;
  board[index + top] += change;
  board[index + top + right] += change;
  board[index + left] += change;
  board[index + right] += change;
  board[index + bottom + left] += change;
  board[index + bottom] += change;
  board[index + bottom + right] += change;
  board[index + forward + top + left] += change;
  board[index + forward + top] += change;
  board[index + forward + top + right] += change;
  board[index + forward + left] += change;
  board[index + forward] += change;
  board[index + forward + right] += change;
  board[index + forward + bottom + left] += change;
  board[index + forward + bottom] += change;
  board[index + forward + bottom + right] += change;
  board[index + backward + top + left] += change;
  board[index + backward + top] += change;
  board[index + backward + top + right] += change;
  board[index + backward + left] += change;
  board[index + backward] += change;
  board[index + backward + right] += change;
  board[index + backward + bottom + left] += change;
  board[index + backward + bottom] += change;
  board[index + backward + bottom + right] += change;
}

