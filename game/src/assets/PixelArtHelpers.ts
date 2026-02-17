import type { PixelData } from '@/assets/PixelArtEngine';

/** Mirror pixel data horizontally (left-right flip) */
export function mirrorHorizontal(data: PixelData): number[][] {
  return data.map(row => [...row].reverse());
}

/** Add 1px outline around non-transparent pixels */
export function applyOutline(data: PixelData, outlineIndex: number): number[][] {
  const height = data.length;
  const width = data[0]?.length || 0;
  const result = data.map(row => [...row]);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = data[y][x];

      // If this pixel is non-transparent, check neighbors
      if (pixel !== 0) {
        // Check 8 directions
        const neighbors = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1],
        ];

        for (const [dy, dx] of neighbors) {
          const ny = y + dy;
          const nx = x + dx;

          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            // If neighbor is transparent, set it to outline
            if (data[ny][nx] === 0) {
              result[ny][nx] = outlineIndex;
            }
          }
        }
      }
    }
  }

  return result;
}

/** Recolor: replace palette indices according to a mapping */
export function recolor(data: PixelData, colorMap: Record<number, number>): number[][] {
  return data.map(row =>
    row.map(pixel => colorMap[pixel] ?? pixel)
  );
}

/** Compose overlay on top of base at given offset */
export function composeLayer(
  base: PixelData,
  overlay: PixelData,
  offsetX: number,
  offsetY: number
): number[][] {
  const height = base.length;
  const width = base[0]?.length || 0;
  const result = base.map(row => [...row]);

  const overlayHeight = overlay.length;
  const overlayWidth = overlay[0]?.length || 0;

  for (let y = 0; y < overlayHeight; y++) {
    for (let x = 0; x < overlayWidth; x++) {
      const targetY = y + offsetY;
      const targetX = x + offsetX;

      if (targetY >= 0 && targetY < height && targetX >= 0 && targetX < width) {
        const pixel = overlay[y][x];
        // Only overlay non-transparent pixels
        if (pixel !== 0) {
          result[targetY][targetX] = pixel;
        }
      }
    }
  }

  return result;
}

/** Create empty pixel data grid filled with transparent */
export function createEmpty(width: number, height: number): number[][] {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

/**
 * Base beaver body template (48x48).
 * Returns a reusable chibi beaver body that can be customized with overlays.
 * 2-head ratio: head ~24px, body ~24px
 * Features: big round eyes, 2 buck teeth, pastel brown fur, cream belly
 * Uses palette indices from PALETTE_INDEX.
 *
 * Palette reference:
 * 0 = transparent
 * 1 = outline (dark brown)
 * 2 = beaver brown
 * 3 = beaver cream
 * 4 = eye white
 * 5 = eye black
 * 6 = teeth white
 */
export function createBeaverBase(): number[][] {
  const grid = createEmpty(48, 48);

  // Head outline (rows 6-28, rounded shape)
  const headOutline = [
    [16, 31], // row 6 - top of head
    [14, 33], // row 7
    [13, 34], // row 8
    [12, 35], // row 9-10
  ];

  // Draw head shape (rows 6-28)
  for (let y = 6; y <= 28; y++) {
    let startX: number, endX: number;

    if (y <= 9) {
      // Top of head (rounded)
      const idx = Math.min(y - 6, headOutline.length - 1);
      [startX, endX] = headOutline[idx];
    } else if (y <= 22) {
      // Main head area
      startX = 11;
      endX = 36;
    } else {
      // Chin area
      startX = 13 + (y - 22) * 2;
      endX = 34 - (y - 22) * 2;
    }

    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX) {
        grid[y][x] = 1; // outline
      } else {
        grid[y][x] = 2; // beaver brown
      }
    }
  }

  // Fill in top of head
  for (let y = 6; y <= 9; y++) {
    const idx = Math.min(y - 6, headOutline.length - 1);
    const [startX, endX] = headOutline[idx];
    for (let x = startX + 1; x < endX; x++) {
      if (grid[y][x] === 0) {
        grid[y][x] = 2; // beaver brown fill
      }
    }
  }

  // Left ear (rows 8-12, x 8-12)
  for (let y = 8; y <= 12; y++) {
    for (let x = 8; x <= 12; x++) {
      const isEdge = y === 8 || y === 12 || x === 8 || x === 12;
      grid[y][x] = isEdge ? 1 : 2;
    }
  }

  // Right ear (rows 8-12, x 35-39)
  for (let y = 8; y <= 12; y++) {
    for (let x = 35; x <= 39; x++) {
      const isEdge = y === 8 || y === 12 || x === 35 || x === 39;
      grid[y][x] = isEdge ? 1 : 2;
    }
  }

  // Left eye (center at row 16, x 18)
  for (let y = 14; y <= 18; y++) {
    for (let x = 16; x <= 20; x++) {
      const dx = x - 18;
      const dy = y - 16;
      if (dx * dx + dy * dy <= 6) {
        grid[y][x] = 4; // white
      }
    }
  }
  // Left pupil
  grid[15][18] = 5;
  grid[15][19] = 5;
  grid[16][18] = 5;
  grid[16][19] = 5;

  // Right eye (center at row 16, x 29)
  for (let y = 14; y <= 18; y++) {
    for (let x = 27; x <= 31; x++) {
      const dx = x - 29;
      const dy = y - 16;
      if (dx * dx + dy * dy <= 6) {
        grid[y][x] = 4; // white
      }
    }
  }
  // Right pupil
  grid[15][28] = 5;
  grid[15][29] = 5;
  grid[16][28] = 5;
  grid[16][29] = 5;

  // Nose (small triangle at row 20-22, centered)
  grid[20][23] = 1;
  grid[20][24] = 1;
  grid[21][22] = 1;
  grid[21][23] = 1;
  grid[21][24] = 1;
  grid[21][25] = 1;
  grid[22][22] = 1;
  grid[22][25] = 1;

  // Buck teeth (rows 24-26, centered)
  // Left tooth
  grid[24][21] = 1; // outline
  grid[24][22] = 6; // white
  grid[24][23] = 6;
  grid[24][24] = 1; // outline
  grid[25][21] = 1;
  grid[25][22] = 6;
  grid[25][23] = 6;
  grid[25][24] = 1;
  grid[26][21] = 1;
  grid[26][22] = 1;
  grid[26][23] = 1;
  grid[26][24] = 1;

  // Right tooth
  grid[24][24] = 1; // outline (shared with left)
  grid[24][25] = 6; // white
  grid[24][26] = 6;
  grid[24][27] = 1; // outline
  grid[25][24] = 1;
  grid[25][25] = 6;
  grid[25][26] = 6;
  grid[25][27] = 1;
  grid[26][24] = 1;
  grid[26][25] = 1;
  grid[26][26] = 1;
  grid[26][27] = 1;

  // Body (rows 28-42, rounded rectangle)
  for (let y = 28; y <= 42; y++) {
    let startX: number, endX: number;

    if (y <= 30) {
      // Neck area (narrower)
      startX = 18;
      endX = 29;
    } else if (y <= 38) {
      // Main body (wider)
      startX = 12;
      endX = 35;
    } else {
      // Bottom (tapering)
      startX = 14 + (y - 38);
      endX = 33 - (y - 38);
    }

    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 42) {
        grid[y][x] = 1; // outline
      } else {
        grid[y][x] = 2; // beaver brown
      }
    }
  }

  // Cream belly (rows 30-40, centered oval)
  for (let y = 30; y <= 40; y++) {
    const width = 8 - Math.abs(y - 35) / 2;
    const startX = Math.floor(24 - width);
    const endX = Math.floor(24 + width);

    for (let x = startX; x <= endX; x++) {
      if (grid[y][x] !== 1) { // don't overwrite outlines
        grid[y][x] = 3; // cream
      }
    }
  }

  // Flat tail (rows 38-46, x 36-46)
  for (let y = 38; y <= 46; y++) {
    const yOffset = y - 38;
    const startX = 36;
    const endX = 46 - yOffset;

    for (let x = startX; x <= endX; x++) {
      if (y === 38 || y === 46 || x === startX || x === endX) {
        grid[y][x] = 1; // outline
      } else {
        grid[y][x] = 2; // beaver brown
      }
    }
  }

  // Add some texture lines on tail
  for (let y = 40; y <= 44; y += 2) {
    for (let x = 38; x <= 42; x++) {
      if (grid[y][x] === 2) {
        grid[y][x] = 15; // darker brown
      }
    }
  }

  return grid;
}
