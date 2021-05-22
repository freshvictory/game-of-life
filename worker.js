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
    case 'test': {
      test();
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

function test() {
  const times = new Array(100);
  console.log('Running tests...');
  for (let i = 0; i < times.length; i++) {
    const board = randomBoard({
      size: 800,
      probability: 0.25
    });
    board.generations = 1;
    const start = performance.now();
    nextBoard(board);
    const end = performance.now();
    times[i] = end - start;
  }
  const results = {
    avg: 0,
    max: 0,
    min: Infinity
  };
  let sum = 0;
  times.forEach((time) => {
    if (time < results.min) {
      results.min = time;
    }
    if (time > results.max) {
      results.max = time;
    }
    sum += time;
  });
  results.avg = sum / times.length;
  console.table(results);
}
