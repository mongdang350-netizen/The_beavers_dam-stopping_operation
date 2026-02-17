import type { PixelData } from '@/assets/PixelArtEngine';

// Dam dimensions: 192x48
// Palette: 0=transparent, 1=outline, 2=beaver brown, 3=cream, 4=white, 5=black, 6=teeth white,
//          7=wood light, 8=wood dark, 9=stone light, 10=stone dark, 13=river light, 14=river dark

// Helper: create a row of wood logs
function woodLogRow(width: number, logPattern: number[] = [7, 8, 7, 8]): number[] {
  const row: number[] = [];
  for (let i = 0; i < width; i++) {
    row.push(logPattern[i % logPattern.length]);
  }
  return row;
}

// Helper: create stone base
function stoneBase(width: number): number[] {
  const row: number[] = [];
  for (let i = 0; i < width; i++) {
    row.push(i % 2 === 0 ? 9 : 10);
  }
  return row;
}

// Dam Stage 1: Full health - solid wooden logs with stone base
const damStage1: PixelData = [
  // Top rows - wooden logs
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  woodLogRow(192),
  // Bottom stone base
  stoneBase(192),
  stoneBase(192),
  stoneBase(192),
  stoneBase(192),
  stoneBase(192),
  stoneBase(192),
];

// Dam Stage 2: Slight damage - 1-2 missing logs and small crack
const damStage2: PixelData = (() => {
  const stage: number[][] = [];
  for (let y = 0; y < 48; y++) {
    if (y < 42) {
      const row = woodLogRow(192);
      // Create a small crack around y=15
      if (y === 15) {
        row[85] = 0; row[86] = 0; row[87] = 0;
      }
      // Missing logs at y=20
      if (y === 20) {
        for (let i = 60; i < 75; i++) {
          row[i] = 0;
        }
      }
      stage.push(row);
    } else {
      stage.push(stoneBase(192));
    }
  }
  return stage;
})();

// Dam Stage 3: Heavy damage - multiple gaps and water seeping
const damStage3: PixelData = (() => {
  const stage: number[][] = [];
  for (let y = 0; y < 48; y++) {
    if (y < 42) {
      const row = woodLogRow(192);
      // Multiple gaps
      if (y >= 12 && y <= 18) {
        for (let i = 40; i < 60; i++) {
          row[i] = 0;
        }
      }
      if (y >= 22 && y <= 26) {
        for (let i = 130; i < 155; i++) {
          row[i] = 0;
        }
      }
      // Water seeping through
      if (y >= 20 && y <= 40) {
        if (y % 3 === 0) {
          for (let i = 35; i < 65; i += 4) {
            if (row[i] === 0) {
              row[i] = 13;
              if (i + 1 < 192) row[i + 1] = 14;
            }
          }
          for (let i = 125; i < 160; i += 4) {
            if (row[i] === 0) {
              row[i] = 13;
              if (i + 1 < 192) row[i + 1] = 14;
            }
          }
        }
      }
      stage.push(row);
    } else {
      stage.push(stoneBase(192));
    }
  }
  return stage;
})();

// Dam Stage 4: Critical damage - mostly broken with lots of water
const damStage4: PixelData = (() => {
  const stage: number[][] = [];
  for (let y = 0; y < 48; y++) {
    if (y < 42) {
      const row = woodLogRow(192);
      // Large gaps
      if (y >= 8 && y <= 22) {
        for (let i = 20; i < 80; i++) {
          row[i] = 0;
        }
      }
      if (y >= 15 && y <= 30) {
        for (let i = 100; i < 180; i++) {
          row[i] = 0;
        }
      }
      // Heavy water flow
      if (y >= 10 && y <= 40) {
        for (let i = 15; i < 85; i += 3) {
          if (row[i] === 0) {
            row[i] = i % 2 === 0 ? 13 : 14;
          }
        }
        for (let i = 95; i < 185; i += 3) {
          if (row[i] === 0) {
            row[i] = i % 2 === 0 ? 13 : 14;
          }
        }
      }
      stage.push(row);
    } else {
      stage.push(stoneBase(192));
    }
  }
  return stage;
})();

// Baby Beaver Expressions: 16x16 each

// Happy baby beaver: smiling face
const babyHappy: PixelData = [
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 1, 0, 0],
  [0, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0],
  [1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1],
  [1, 2, 3, 3, 4, 5, 3, 3, 3, 3, 4, 5, 3, 3, 2, 1],
  [1, 2, 3, 3, 5, 5, 3, 3, 3, 3, 5, 5, 3, 3, 2, 1],
  [1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
  [1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
  [1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1],
  [1, 2, 2, 3, 3, 1, 1, 1, 1, 1, 1, 3, 3, 2, 2, 1],
  [0, 1, 2, 2, 3, 1, 6, 6, 6, 6, 1, 3, 2, 2, 1, 0],
  [0, 0, 1, 2, 2, 1, 6, 6, 6, 6, 1, 2, 2, 1, 0, 0],
  [0, 0, 0, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
];

// Sad baby beaver: frown
const babySad: PixelData = [
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 1, 0, 0],
  [0, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0],
  [1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1],
  [1, 2, 3, 3, 4, 5, 3, 3, 3, 3, 4, 5, 3, 3, 2, 1],
  [1, 2, 3, 3, 5, 5, 3, 3, 3, 3, 5, 5, 3, 3, 2, 1],
  [1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
  [1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
  [1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1],
  [1, 2, 2, 3, 3, 1, 1, 1, 1, 1, 1, 3, 3, 2, 2, 1],
  [0, 1, 2, 2, 3, 1, 6, 6, 6, 6, 1, 3, 2, 2, 1, 0],
  [0, 0, 1, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 1, 0, 0],
  [0, 0, 0, 1, 2, 2, 6, 6, 6, 6, 2, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
];

// Scared baby beaver: wide eyes
const babyScared: PixelData = [
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 1, 0, 0],
  [0, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0],
  [1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1],
  [1, 2, 3, 3, 4, 4, 4, 3, 3, 4, 4, 4, 3, 3, 2, 1],
  [1, 2, 3, 3, 4, 4, 4, 3, 3, 4, 4, 4, 3, 3, 2, 1],
  [1, 2, 3, 3, 4, 5, 5, 3, 3, 4, 5, 5, 3, 3, 2, 1],
  [1, 2, 3, 3, 4, 5, 5, 3, 3, 4, 5, 5, 3, 3, 2, 1],
  [1, 2, 2, 3, 4, 4, 4, 3, 3, 4, 4, 4, 3, 2, 2, 1],
  [1, 2, 2, 3, 3, 1, 1, 1, 1, 1, 1, 3, 3, 2, 2, 1],
  [0, 1, 2, 2, 3, 1, 3, 3, 3, 3, 1, 3, 2, 2, 1, 0],
  [0, 0, 1, 2, 2, 1, 3, 3, 3, 3, 1, 2, 2, 1, 0, 0],
  [0, 0, 0, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
];

// Sleeping baby beaver: closed eyes and zzz
const babySleeping: PixelData = [
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 1, 0, 0],
  [0, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0],
  [1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1],
  [1, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 1],
  [1, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 1],
  [1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
  [1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
  [1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1],
  [1, 2, 2, 3, 3, 1, 1, 1, 1, 1, 1, 3, 3, 2, 2, 1],
  [0, 1, 2, 2, 3, 1, 6, 6, 6, 6, 1, 3, 2, 2, 1, 0],
  [0, 0, 1, 2, 2, 1, 6, 6, 6, 6, 1, 2, 2, 1, 0, 0],
  [0, 0, 0, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
];

export const damStages: PixelData[] = [damStage1, damStage2, damStage3, damStage4];
export const babyBeaverExpressions: PixelData[] = [babyHappy, babySad, babyScared, babySleeping];
export const damPixelArt = { damStages, babyBeaverExpressions };
