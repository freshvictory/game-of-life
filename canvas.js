export function getOptions(canvas) {
  const { width: canvasSize } = canvas;
  const context = canvas.getContext('2d', { antialias: false });
  context.imageSmoothingEnabled = false;
  return {
    canvasSize,
    context,
    imageData: context.createImageData(canvasSize, canvasSize)
  };
}

export function clear(canvas) {
  const { context, canvasSize } = getOptions(canvas);
  context.clearRect(0, 0, canvasSize, canvasSize);
}


export function draw({ canvasOptions, previewOptions, previewCoordinates, cellSize, color, board }) {
  const imageData = canvasOptions.imageData;
  const boardArray = new Uint8Array(board.buffer);
  for (let y = 0; y < board.size; y++) {
    for (let x = 0; x < board.size; x++) {
      const index = x + y * board.size;
      const dataOffset = (x * cellSize + y * cellSize * canvasOptions.canvasSize) * 4;
      const cell = boardArray[index] & 1;
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
  if (previewCoordinates.x) {
    const previewX = previewCoordinates.x - (previewOptions.canvasSize / 2);
    const previewY = previewCoordinates.y - (previewOptions.canvasSize / 2);
    const previewWidth = previewOptions.canvasSize;
    canvasOptions.context.strokeRect(
      previewX - 1,
      previewY - 1,
      previewWidth + 2,
      previewWidth + 2
    );
    const previewImageData = previewOptions.imageData;
    for (let y = 0; y < previewWidth; y++) {
      for (let x = 0; x < previewWidth; x++) {
        const previewIndex = (x + y * previewWidth) * 4;
        const fullIndex = (x + previewX + (y + previewY) * canvasOptions.canvasSize) * 4;
        previewImageData.data[previewIndex] = imageData.data[fullIndex];
        previewImageData.data[previewIndex + 1] = imageData.data[fullIndex + 1];
        previewImageData.data[previewIndex + 2] = imageData.data[fullIndex + 2];
        previewImageData.data[previewIndex + 3] = imageData.data[fullIndex + 3];
      }
    }
    previewOptions.context.putImageData(previewImageData, 0, 0);
  }
}
