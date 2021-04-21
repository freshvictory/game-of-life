const indexFunctions = {
  left(index, size) {
    return index % size === 0 ? index + size - 1 : index - 1;
  },
  right(index, size) {
    return index % size === size - 1 ? index - size + 1 : index + 1;
  },
  top(index, size) {
    return index < size ? index + size * (size - 1) : index - size;
  },
  bottom(index, size) {
    return index >= size * (size - 1) ? index - size * (size - 1) : index + size;
  }
};

function computeNeighborIndexes(size) {
  const array = new Array(size * size);
  for (let i = 0; i < array.length; i++) {
    const left = indexFunctions.left(i, size);
    const right = indexFunctions.right(i, size);
    array[i] = [
      indexFunctions.top(left, size),
      indexFunctions.top(i, size),
      indexFunctions.top(right, size),
      left,
      right,
      indexFunctions.bottom(left, size),
      indexFunctions.bottom(i, size),
      indexFunctions.bottom(right, size)
    ];
  }
  return array;
}


function computeIndexes(size) {
  const array = new Array(size * size);
  for (let i = 0; i < array.length; i++) {
    array[i] = [i % size, Math.floor(i / size)];
  }
  return array;
}

function random(size) {
  return new Array(size).fill(0)
    .map(function (y) {
      return new Array(size).fill(0)
        .map(function (x) {
          return Math.round(Math.random() * Math.random());
        });
    });
}


export function randomBoard(size) {
  return fromBoard(random(size), size);
}

export function fromBoard(board, size) {
  const indexes = computeIndexes(size);
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
    neighborIndexes,
    indexes
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
export function next({ board, neighborIndexes, indexes, size }) {
  const newBuffer = board.buffer.slice(0);
  const newBoard = new Uint8Array(newBuffer);
  for (let i = 0; i < board.length; i++) {
    const cell = board[i];
    const aliveNow = cell & 1;
    const neighbors = (cell & 30) >> 1;
    const isAliveNext = neighbors === 3 || (!!aliveNow && neighbors === 2);
    const aliveNext = isAliveNext ? 1 : 0;
    const newNeighbors = (newBoard[i] & 30) >> 1;
    newBoard[i] = (newNeighbors << 1) + aliveNext;
    if (aliveNext !== aliveNow) {
      for (const neighborIndex of neighborIndexes[i]) {
        newBoard[neighborIndex] += isAliveNext ? 2 : -2;
      }
    }
  }
  return {
    size,
    board: newBoard,
    old: board,
    neighborIndexes,
    indexes
  };
}
