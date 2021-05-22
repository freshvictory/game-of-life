importScripts('./conway.js');

let working = false;
onmessage = function ({ data }) {
  switch (data.request) {
    case 'random': {
      const board = randomBoard(data.params);
      postMessage({
        response: 'random',
        board
      });
      return;
    }
    case 'next': {
      if (working) { return; }
      working = true;
      const board = nextBoard(data.params);
      working = false;
      postMessage({
        response: 'next',
        size: board.size,
        buffer: board.buffer
      }, [
        board.buffer
      ]);
      return;
    }
  }
};


function randomBoard(params) {
  return fromBoard(random(params.size, params.probability), params.size);
}

function nextBoard(params) {
  let board = {
    buffer: params.buffer,
    size: params.size
  };
  for (let i = 0; i < params.generations; i++) {
    board = next(board);
  }
  return board;
}
