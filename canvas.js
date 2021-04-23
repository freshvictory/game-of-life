export function getOptions(canvas) {
  const { clientWidth: canvasSize } = canvas;
  const context = canvas.getContext('2d', { alpha: false, antialias: false });
  context.imageSmoothingEnabled = false;
  return {
    canvasSize,
    context,
    imageData: context.createImageData(canvasSize, canvasSize)
  };
}

export function clear({ context, canvasSize }) {
  context.clearRect(0, 0, canvasSize, canvasSize);
}


export function draw({ canvasOptions, cellSize, color, board }) {
  const imageData = canvasOptions.imageData;
  for (let y = 0; y < board.size; y++) {
    for (let x = 0; x < board.size; x++) {
      const index = x + y * board.size;
      const dataOffset = (x * cellSize + y * cellSize * canvasOptions.canvasSize) * 4;
      const cell = board.board[index] & 1;
      const oldCell = imageData.data[dataOffset + 3];
      if (oldCell !== cell * 255) {
        for (let j = 0; j < cellSize; j++) {
          for (let k = 0; k < cellSize; k++) {
            const offset = dataOffset + (j + k * canvasOptions.canvasSize) * 4;
            imageData.data[offset] = color[0];
            imageData.data[offset + 1] = color[1];
            imageData.data[offset + 2] = color[2];
            imageData.data[offset + 3] = cell * 255;
          }
        }
      }
    }
  }
  canvasOptions.context.putImageData(imageData, 0, 0);
}
