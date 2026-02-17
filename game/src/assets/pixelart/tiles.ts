import type { PixelData } from '@/assets/PixelArtEngine';

/**
 * Background tiles and decorations pixel art data.
 *
 * Palette indices:
 * 0 = transparent
 * 1 = outline (dark brown)
 * 2 = beaver brown
 * 3 = cream
 * 7 = wood light
 * 8 = wood dark
 * 9 = stone light
 * 10 = stone dark
 * 11 = grass light
 * 12 = grass dark
 * 13 = river light (light blue)
 * 14 = river dark (dark blue)
 */

/** Helper to create isometric diamond shape (48x48) */
function createIsometricDiamond(fillColor: number, shadeColor: number): number[][] {
  const grid: number[][] = Array.from({ length: 48 }, () => Array(48).fill(0));

  // Diamond: top at (24,0), left at (0,24), right at (47,24), bottom at (24,47)
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 48; x++) {
      // Check if point is inside diamond
      const dx = Math.abs(x - 24);
      const dy = Math.abs(y - 24);

      if (dx + dy <= 24) {
        // Add shading on bottom-right edges
        const isShaded = (y > 30 && x > 24) || (y > 36);
        grid[y][x] = isShaded ? shadeColor : fillColor;
      }
    }
  }

  return grid;
}

// =============================================================================
// GRASS TILES (48x48 isometric diamond)
// =============================================================================

/** Base grass tile with simple shading */
export const grassTile1: PixelData = createIsometricDiamond(11, 12);

/** Grass tile with small flower spots */
export const grassTile2: PixelData = (() => {
  const grid = createIsometricDiamond(11, 12);

  // Add small flower spots (cream color)
  const flowerSpots = [
    [15, 20], [15, 21],
    [20, 28], [20, 29],
    [28, 18], [28, 19],
    [35, 25], [35, 26],
  ];

  for (const [y, x] of flowerSpots) {
    if (grid[y][x] !== 0) {
      grid[y][x] = 3;
    }
  }

  return grid;
})();

/** Grass tile with pebbles */
export const grassTile3: PixelData = (() => {
  const grid = createIsometricDiamond(11, 12);

  // Add pebble spots (stone colors)
  const pebbles = [
    // Small pebble 1
    [18, 22], [18, 23],
    [19, 22], [19, 23],
    // Small pebble 2
    [25, 30], [25, 31],
    [26, 30], [26, 31],
    // Small pebble 3
    [32, 20], [32, 21],
    [33, 20], [33, 21],
  ];

  for (let i = 0; i < pebbles.length; i++) {
    const [y, x] = pebbles[i];
    if (grid[y][x] !== 0) {
      // Alternate between light and dark stone
      grid[y][x] = i % 4 < 2 ? 9 : 10;
    }
  }

  return grid;
})();

// =============================================================================
// RIVER TILES (48x48 with animation frames)
// =============================================================================

/** River straight segment - frame 1 */
const riverStraightFrame1: PixelData = (() => {
  const grid: number[][] = Array.from({ length: 48 }, () => Array(48).fill(0));

  // Fill entire tile with river
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 48; x++) {
      // Create wave pattern
      const waveOffset = Math.sin((x + y) / 6) > 0 ? 1 : 0;
      grid[y][x] = waveOffset ? 13 : 14;
    }
  }

  // Add some lighter flow lines
  for (let y = 10; y < 40; y += 8) {
    for (let x = 5; x < 43; x += 3) {
      grid[y][x] = 13;
      grid[y][x + 1] = 13;
    }
  }

  return grid;
})();

/** River straight segment - frame 2 (shifted wave pattern) */
const riverStraightFrame2: PixelData = (() => {
  const grid: number[][] = Array.from({ length: 48 }, () => Array(48).fill(0));

  // Fill entire tile with river (wave shifted)
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 48; x++) {
      const waveOffset = Math.sin((x + y + 3) / 6) > 0 ? 1 : 0;
      grid[y][x] = waveOffset ? 13 : 14;
    }
  }

  // Add flow lines (shifted)
  for (let y = 10; y < 40; y += 8) {
    for (let x = 8; x < 43; x += 3) {
      grid[y][x] = 13;
      grid[y][x + 1] = 13;
    }
  }

  return grid;
})();

export const riverStraightFrames: PixelData[] = [riverStraightFrame1, riverStraightFrame2];

/** River curve segment - frame 1 */
const riverCurveFrame1: PixelData = (() => {
  const grid: number[][] = Array.from({ length: 48 }, () => Array(48).fill(0));

  // Create curved river (top-left to bottom-right curve)
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 48; x++) {
      const dx = x - 24;
      const dy = y - 24;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 30 && dist > 10) {
        const waveOffset = Math.sin((x + y) / 6) > 0 ? 1 : 0;
        grid[y][x] = waveOffset ? 13 : 14;
      }
    }
  }

  return grid;
})();

/** River curve segment - frame 2 */
const riverCurveFrame2: PixelData = (() => {
  const grid: number[][] = Array.from({ length: 48 }, () => Array(48).fill(0));

  // Create curved river (wave shifted)
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 48; x++) {
      const dx = x - 24;
      const dy = y - 24;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 30 && dist > 10) {
        const waveOffset = Math.sin((x + y + 3) / 6) > 0 ? 1 : 0;
        grid[y][x] = waveOffset ? 13 : 14;
      }
    }
  }

  return grid;
})();

export const riverCurveFrames: PixelData[] = [riverCurveFrame1, riverCurveFrame2];

/** River merge/split point - frame 1 */
const riverMergeFrame1: PixelData = (() => {
  const grid: number[][] = Array.from({ length: 48 }, () => Array(48).fill(0));

  // Create Y-shaped merge
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 48; x++) {
      let inRiver = false;

      // Main vertical stream
      if (Math.abs(x - 24) < 8) {
        inRiver = true;
      }

      // Left branch (top-left)
      if (y < 24 && x < 24 && Math.abs((x - 12) - (24 - y) / 2) < 4) {
        inRiver = true;
      }

      // Right branch (top-right)
      if (y < 24 && x > 24 && Math.abs((x - 36) + (24 - y) / 2) < 4) {
        inRiver = true;
      }

      if (inRiver) {
        const waveOffset = Math.sin((x + y) / 6) > 0 ? 1 : 0;
        grid[y][x] = waveOffset ? 13 : 14;
      }
    }
  }

  return grid;
})();

/** River merge/split point - frame 2 */
const riverMergeFrame2: PixelData = (() => {
  const grid: number[][] = Array.from({ length: 48 }, () => Array(48).fill(0));

  // Create Y-shaped merge (wave shifted)
  for (let y = 0; y < 48; y++) {
    for (let x = 0; x < 48; x++) {
      let inRiver = false;

      // Main vertical stream
      if (Math.abs(x - 24) < 8) {
        inRiver = true;
      }

      // Left branch
      if (y < 24 && x < 24 && Math.abs((x - 12) - (24 - y) / 2) < 4) {
        inRiver = true;
      }

      // Right branch
      if (y < 24 && x > 24 && Math.abs((x - 36) + (24 - y) / 2) < 4) {
        inRiver = true;
      }

      if (inRiver) {
        const waveOffset = Math.sin((x + y + 3) / 6) > 0 ? 1 : 0;
        grid[y][x] = waveOffset ? 13 : 14;
      }
    }
  }

  return grid;
})();

export const riverMergeFrames: PixelData[] = [riverMergeFrame1, riverMergeFrame2];

// =============================================================================
// TREES (48x64)
// =============================================================================

/** Round leafy tree */
export const tree1: PixelData = (() => {
  const grid: number[][] = Array.from({ length: 64 }, () => Array(48).fill(0));

  // Canopy (large round shape, rows 8-36)
  for (let y = 8; y <= 36; y++) {
    for (let x = 6; x <= 41; x++) {
      const dx = x - 24;
      const dy = y - 22;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 18) {
        // Add some texture variation
        const isShaded = (dx > 0 && dy > 0) || Math.random() > 0.7;
        grid[y][x] = isShaded ? 12 : 11;
      }
    }
  }

  // Trunk (rows 32-58, centered)
  for (let y = 32; y <= 58; y++) {
    for (let x = 20; x <= 27; x++) {
      if (x === 20 || x === 27) {
        grid[y][x] = 8; // dark wood outline
      } else {
        const isShaded = x > 23;
        grid[y][x] = isShaded ? 8 : 7;
      }
    }
  }

  // Add some branch hints in canopy
  grid[18][24] = 8;
  grid[19][24] = 8;
  grid[20][23] = 8;
  grid[20][25] = 8;

  return grid;
})();

/** Pine tree */
export const tree2: PixelData = (() => {
  const grid: number[][] = Array.from({ length: 64 }, () => Array(48).fill(0));

  // Pine tree shape (triangular layers)
  const layers = [
    { y: 10, width: 8 },
    { y: 16, width: 12 },
    { y: 22, width: 16 },
    { y: 28, width: 20 },
    { y: 34, width: 18 },
  ];

  for (const layer of layers) {
    const { y, width } = layer;
    for (let dy = 0; dy < 6; dy++) {
      const rowWidth = width - dy;
      const startX = 24 - Math.floor(rowWidth / 2);
      const endX = 24 + Math.floor(rowWidth / 2);

      for (let x = startX; x <= endX; x++) {
        grid[y + dy][x] = 12; // grass dark (pine needles)
      }
    }
  }

  // Trunk (rows 38-58)
  for (let y = 38; y <= 58; y++) {
    for (let x = 21; x <= 26; x++) {
      if (x === 21 || x === 26) {
        grid[y][x] = 8;
      } else {
        grid[y][x] = 7;
      }
    }
  }

  return grid;
})();

// =============================================================================
// DECORATIONS
// =============================================================================

/** Tree stump (48x32) */
export const stump: PixelData = (() => {
  const grid: number[][] = Array.from({ length: 32 }, () => Array(48).fill(0));

  // Main stump body (rows 8-28, centered)
  for (let y = 8; y <= 28; y++) {
    const width = 16 - Math.abs(y - 18) / 4;
    const startX = Math.floor(24 - width);
    const endX = Math.floor(24 + width);

    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 28) {
        grid[y][x] = 8; // dark outline
      } else {
        const isShaded = x > 24;
        grid[y][x] = isShaded ? 8 : 7;
      }
    }
  }

  // Top cut surface (rows 8-10)
  for (let y = 8; y <= 10; y++) {
    for (let x = 14; x <= 33; x++) {
      const dx = Math.abs(x - 24);
      if (dx < 10) {
        grid[y][x] = 7;
      }
    }
  }

  // Add rings on top
  for (let r = 2; r < 8; r += 2) {
    for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
      const x = Math.floor(24 + r * Math.cos(angle));
      const y = Math.floor(9 + r * Math.sin(angle) * 0.5);
      if (y >= 8 && y <= 10 && x >= 14 && x <= 33) {
        grid[y][x] = 8;
      }
    }
  }

  return grid;
})();

/** Thorny barrier (48x48) */
export const barrier: PixelData = (() => {
  const grid: number[][] = Array.from({ length: 48 }, () => Array(48).fill(0));

  // Horizontal branches (rows 20-28)
  for (let y = 20; y <= 28; y++) {
    for (let x = 4; x < 44; x++) {
      if (y === 20 || y === 28) {
        grid[y][x] = 8; // dark wood
      } else if (y === 24) {
        grid[y][x] = 8;
      }
    }
  }

  // Vertical branches
  for (let x = 8; x < 40; x += 8) {
    for (let y = 12; y <= 36; y++) {
      grid[y][x] = 8;
    }
  }

  // Add thorns (small triangular spikes)
  const thornPositions = [
    [16, 8], [16, 16], [16, 24], [16, 32],
    [32, 8], [32, 16], [32, 24], [32, 32],
    [24, 4], [24, 12], [24, 20], [24, 28], [24, 36], [24, 42],
  ];

  for (const [y, x] of thornPositions) {
    // Draw small thorn
    grid[y][x] = 12; // grass dark (thorn color)
    grid[y - 1][x] = 12;
    grid[y + 1][x] = 12;
    grid[y][x - 1] = 12;
    grid[y][x + 1] = 12;
  }

  return grid;
})();

// =============================================================================
// EXPORT COLLECTION
// =============================================================================

export const tilePixelArt = {
  grass: [grassTile1, grassTile2, grassTile3],
  riverStraight: riverStraightFrames,
  riverCurve: riverCurveFrames,
  riverMerge: riverMergeFrames,
  tree1,
  tree2,
  stump,
  barrier,
};
