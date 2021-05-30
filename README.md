# Conway's Game of Life

A simple web-based Life runner.

## Development

### Running the App

Just serve `index.html` with any web server.

### Compiling to WebAssembly

If you change `conway.c` and want to recompile, you'll first need `emscripten` which you can download [here](https://emscripten.org/docs/getting_started/downloads.html).

Then, run:

```
emcc -O3 conway.c -s WASM=1 -o wasm.js -s EXPORTED_FUNCTIONS='["_fromBoard", "_next", "_malloc", "_free"]' -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]'
```
