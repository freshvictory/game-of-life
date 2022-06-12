/**
 * @typedef
 *  {{
 *    size: number,
 *    context: CanvasRenderingContext2D,
 *    imageData: ImageData
 *  }}
 *  CanvasOptions
 * */

/**
 * Given a canvas and a desired size, resizes the canvas
 * and creates a rendering context and image data.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} size
 * @returns {CanvasOptions}
 */
export function getOptions(canvas, size) {
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create rendering context.");
  }
  context.imageSmoothingEnabled = false;
  return {
    size,
    context,
    imageData: context.createImageData(size, size),
  };
}

/**
 * Clears a canvas.
 *
 * @param {CanvasOptions | HTMLCanvasElement} canvasOptions
 */
export function clear(canvasOptions) {
  if (!("context" in canvasOptions)) {
    canvasOptions = getOptions(canvasOptions, canvasOptions.width);
  }
  canvasOptions.context.clearRect(0, 0, canvasOptions.size, canvasOptions.size);
}

/**
 * Draws a board to a canvas in the given color.
 *
 * @param {{
 *  canvasOptions: CanvasOptions,
 *  color: [number, number, number],
 *  board: Board
 * }} _
 */
export function draw({ canvasOptions, color, board }) {
  const imageData = canvasOptions.imageData;
  const boardArray = new Uint8Array(board.buffer);
  for (let i = 0; i < boardArray.length; i++) {
    const dataOffset = i * 4;
    const cell = boardArray[i] & 1;
    const oldCell = imageData.data[dataOffset + 3];
    if (oldCell !== cell * 255) {
      imageData.data[dataOffset] = color[0];
      imageData.data[dataOffset + 1] = color[1];
      imageData.data[dataOffset + 2] = color[2];
      imageData.data[dataOffset + 3] = cell * 255;
    }
  }
  canvasOptions.context.putImageData(imageData, 0, 0);
}
