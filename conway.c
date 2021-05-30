#include <string.h>

typedef unsigned char cell;

int CHANGED[] = {0, -1, 0, -1, 0, 0, 1, 0, 0, -1, 0, -1, 0, -1, 0, -1, 0, -1};

void fromBoard(int size, cell* initial, cell* output) {
    memset(output, 0, size * size);
    for (int y = 0; y < size; y++) {
        for (int x = 0; x < size; x++) {
            int index = x + y * size;
            output[index] += initial[index];
            if (initial[index] == 1) {
                int left = x == 0 ? size - 1 : -1;
                int right = x == size - 1 ? 1 - size : 1;
                int top = y == 0 ? size * (size - 1) : -size;
                int bottom = y == size - 1 ? size * (1 - size) : size;
                int change = 2;
                output[index + top + left] += change;
                output[index + top] += change;
                output[index + top + right] += change;
                output[index + left] += change;
                output[index + right] += change;
                output[index + bottom + left] += change;
                output[index + bottom] += change;
                output[index + bottom + right] += change;
            }
        }
    }
}

void next(int size, cell* current, int generations, cell* output) {
    memcpy(output, current, size * size);
    for (int i = 0; i < generations; i++) {
        for (int y = 0; y < size; y++) {
            for (int x = 0; x < size; x++) {
                int index = x + y * size;
                int cell = current[index];
                if (CHANGED[cell] != 0) {
                    output[index] += CHANGED[cell];
                    int left = x == 0 ? size - 1 : -1;
                    int right = x == size - 1 ? 1 - size : 1;
                    int top = y == 0 ? size * (size - 1) : -size;
                    int bottom = y == size - 1 ? size * (1 - size) : size;
                    int change = CHANGED[cell] * 2;
                    output[index + top + left] += change;
                    output[index + top] += change;
                    output[index + top + right] += change;
                    output[index + left] += change;
                    output[index + right] += change;
                    output[index + bottom + left] += change;
                    output[index + bottom] += change;
                    output[index + bottom + right] += change;
                }
            }
        }
        if (i < generations + 1) {
            memcpy(current, output, size * size);
        }
    }
}
