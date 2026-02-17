import type { PixelData } from '@/assets/PixelArtEngine';
import { createEmpty } from '@/assets/PixelArtHelpers';

export interface ProjectilePixelArt {
  frames: PixelData[];  // 1-2 frames (rotation/trail)
  size: number;         // 16 or 24
}

// Stone projectile (16x16)
const stoneFrame = (() => {
  const grid = createEmpty(16, 16);

  // Round stone
  for (let y = 4; y <= 11; y++) {
    for (let x = 4; x <= 11; x++) {
      const dx = x - 7.5;
      const dy = y - 7.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 4) {
        if (dist <= 3.5) {
          grid[y][x] = y < 8 ? 9 : 10; // lighter top, darker bottom
        } else {
          grid[y][x] = 1; // outline
        }
      }
    }
  }

  // Texture spots
  grid[6][6] = 10;
  grid[7][9] = 10;
  grid[9][7] = 10;

  return grid;
})();

const stone: ProjectilePixelArt = {
  frames: [stoneFrame],
  size: 16
};

// Arrow projectile (16x16)
const arrowFrame = (() => {
  const grid = createEmpty(16, 16);

  // Shaft (horizontal)
  for (let x = 2; x <= 12; x++) {
    grid[7][x] = 7; // wood light
    grid[8][x] = 8; // wood dark
  }

  // Stone tip
  grid[6][13] = 10;
  grid[7][13] = 10;
  grid[8][13] = 10;
  grid[7][14] = 10;
  grid[8][14] = 10;
  grid[7][15] = 10;

  // Fletching
  grid[5][2] = 1;
  grid[6][2] = 1;
  grid[9][2] = 1;
  grid[10][2] = 1;
  grid[6][3] = 1;
  grid[9][3] = 1;

  return grid;
})();

const arrow: ProjectilePixelArt = {
  frames: [arrowFrame],
  size: 16
};

// Dart projectile (16x16)
const dartFrame = (() => {
  const grid = createEmpty(16, 16);

  // Thin shaft
  for (let x = 3; x <= 11; x++) {
    grid[7][x] = 12; // grass light
    grid[8][x] = 12;
  }

  // Sharp tip
  grid[7][12] = 1;
  grid[8][12] = 1;
  grid[7][13] = 1;
  grid[8][13] = 1;
  grid[7][14] = 1;

  // Small fletching
  grid[6][3] = 12;
  grid[9][3] = 12;

  return grid;
})();

const dart: ProjectilePixelArt = {
  frames: [dartFrame],
  size: 16
};

// Bomb projectile (24x24) - 2 frames with fuse spark
const bombFrame1 = (() => {
  const grid = createEmpty(24, 24);

  // Round black bomb
  for (let y = 8; y <= 19; y++) {
    for (let x = 8; x <= 19; x++) {
      const dx = x - 13.5;
      const dy = y - 13.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 6) {
        if (dist <= 5.5) {
          grid[y][x] = 5; // black
        } else {
          grid[y][x] = 1; // outline
        }
      }
    }
  }

  // Fuse
  for (let y = 4; y <= 8; y++) {
    grid[y][13] = 8; // wood dark
  }

  // Spark at fuse tip
  grid[3][13] = 4; // white spark

  return grid;
})();

const bombFrame2 = (() => {
  const grid = createEmpty(24, 24);

  // Round black bomb
  for (let y = 8; y <= 19; y++) {
    for (let x = 8; x <= 19; x++) {
      const dx = x - 13.5;
      const dy = y - 13.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 6) {
        if (dist <= 5.5) {
          grid[y][x] = 5;
        } else {
          grid[y][x] = 1;
        }
      }
    }
  }

  // Fuse
  for (let y = 4; y <= 8; y++) {
    grid[y][13] = 8;
  }

  // Larger spark
  grid[2][13] = 4;
  grid[3][12] = 4;
  grid[3][13] = 4;
  grid[3][14] = 4;

  return grid;
})();

const bomb: ProjectilePixelArt = {
  frames: [bombFrame1, bombFrame2],
  size: 24
};

// Fireball projectile (24x24) - 2 frames
const fireballFrame1 = (() => {
  const grid = createEmpty(24, 24);

  // Inner core (white hot)
  for (let y = 10; y <= 13; y++) {
    for (let x = 10; x <= 13; x++) {
      grid[y][x] = 4; // white
    }
  }

  // Middle layer (orange/light - using teeth color as orange proxy)
  const middlePixels = [
    [9, 10], [9, 11], [9, 12], [9, 13],
    [10, 9], [10, 14],
    [11, 9], [11, 14],
    [12, 9], [12, 14],
    [13, 9], [13, 14],
    [14, 10], [14, 11], [14, 12], [14, 13]
  ];
  for (const [y, x] of middlePixels) {
    grid[y][x] = 6; // using teeth white as bright glow
  }

  // Outer layer (red/dark - using dark brown as red proxy)
  const outerPixels = [
    [8, 10], [8, 11], [8, 12], [8, 13],
    [9, 8], [9, 9], [9, 14], [9, 15],
    [10, 8], [10, 15],
    [11, 8], [11, 15],
    [12, 8], [12, 15],
    [13, 8], [13, 15],
    [14, 8], [14, 9], [14, 14], [14, 15],
    [15, 10], [15, 11], [15, 12], [15, 13]
  ];
  for (const [y, x] of outerPixels) {
    grid[y][x] = 15; // dark brown as red
  }

  // Flame wisps
  grid[7][11] = 6;
  grid[7][12] = 6;
  grid[6][11] = 15;

  return grid;
})();

const fireballFrame2 = (() => {
  const grid = createEmpty(24, 24);

  // Slightly shifted core
  for (let y = 10; y <= 13; y++) {
    for (let x = 11; x <= 14; x++) {
      grid[y][x] = 4;
    }
  }

  // Middle layer
  const middlePixels = [
    [9, 11], [9, 12], [9, 13], [9, 14],
    [10, 10], [10, 15],
    [11, 10], [11, 15],
    [12, 10], [12, 15],
    [13, 10], [13, 15],
    [14, 11], [14, 12], [14, 13], [14, 14]
  ];
  for (const [y, x] of middlePixels) {
    grid[y][x] = 6;
  }

  // Outer layer
  const outerPixels = [
    [8, 11], [8, 12], [8, 13], [8, 14],
    [9, 9], [9, 10], [9, 15], [9, 16],
    [10, 9], [10, 16],
    [11, 9], [11, 16],
    [12, 9], [12, 16],
    [13, 9], [13, 16],
    [14, 9], [14, 10], [14, 15], [14, 16],
    [15, 11], [15, 12], [15, 13], [15, 14]
  ];
  for (const [y, x] of outerPixels) {
    grid[y][x] = 15;
  }

  // Different flame wisps
  grid[7][12] = 6;
  grid[7][13] = 6;
  grid[6][13] = 15;
  grid[16][12] = 6;

  return grid;
})();

const fireball: ProjectilePixelArt = {
  frames: [fireballFrame1, fireballFrame2],
  size: 24
};

// Lightning bolt (24x24) - 2 frames
const lightningFrame1 = (() => {
  const grid = createEmpty(24, 24);

  // Zigzag pattern
  const boltPattern = [
    [2, 12], [3, 12], [4, 12],
    [5, 11], [6, 11],
    [7, 12], [8, 12],
    [9, 13], [10, 13],
    [11, 12], [12, 12],
    [13, 11], [14, 11],
    [15, 12], [16, 12], [17, 12]
  ];

  for (const [y, x] of boltPattern) {
    grid[y][x] = 4; // white core
    // Add glow
    grid[y][x - 1] = 1;
    grid[y][x + 1] = 1;
  }

  return grid;
})();

const lightningFrame2 = (() => {
  const grid = createEmpty(24, 24);

  // Slightly different zigzag
  const boltPattern = [
    [2, 11], [3, 11], [4, 11],
    [5, 12], [6, 12],
    [7, 13], [8, 13],
    [9, 12], [10, 12],
    [11, 11], [12, 11],
    [13, 12], [14, 12],
    [15, 13], [16, 13], [17, 13]
  ];

  for (const [y, x] of boltPattern) {
    grid[y][x] = 4;
    grid[y][x - 1] = 1;
    grid[y][x + 1] = 1;
  }

  // Additional spark
  grid[9][14] = 4;
  grid[13][10] = 4;

  return grid;
})();

const lightning: ProjectilePixelArt = {
  frames: [lightningFrame1, lightningFrame2],
  size: 24
};

// Rolling log (24x24) - 2 frames showing rotation
const logFrame1 = (() => {
  const grid = createEmpty(24, 24);

  // Horizontal log cylinder
  for (let y = 8; y <= 15; y++) {
    for (let x = 4; x <= 19; x++) {
      if (y === 8 || y === 15) {
        grid[y][x] = 1; // outline
      } else {
        grid[y][x] = y < 12 ? 7 : 8; // wood light top, dark bottom
      }
    }
  }

  // End circles
  for (let y = 9; y <= 14; y++) {
    grid[y][4] = 8;
    grid[y][19] = 8;
  }

  // Wood grain lines
  for (let x = 6; x <= 17; x += 4) {
    for (let y = 9; y <= 14; y++) {
      grid[y][x] = 8;
    }
  }

  // Wood rings on end
  grid[11][4] = 7;
  grid[12][4] = 7;
  grid[11][19] = 7;
  grid[12][19] = 7;

  return grid;
})();

const logFrame2 = (() => {
  const grid = createEmpty(24, 24);

  // Horizontal log (rotated texture)
  for (let y = 8; y <= 15; y++) {
    for (let x = 4; x <= 19; x++) {
      if (y === 8 || y === 15) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = y < 12 ? 8 : 7; // inverted shading
      }
    }
  }

  // End circles
  for (let y = 9; y <= 14; y++) {
    grid[y][4] = 8;
    grid[y][19] = 8;
  }

  // Different grain position
  for (let x = 8; x <= 19; x += 4) {
    for (let y = 9; y <= 14; y++) {
      grid[y][x] = 7;
    }
  }

  // Wood rings
  grid[10][4] = 8;
  grid[13][4] = 8;
  grid[10][19] = 8;
  grid[13][19] = 8;

  return grid;
})();

const log: ProjectilePixelArt = {
  frames: [logFrame1, logFrame2],
  size: 24
};

// Water bomb (24x24) - 2 frames
const waterBombFrame1 = (() => {
  const grid = createEmpty(24, 24);

  // Water bottle shape
  // Neck
  for (let y = 6; y <= 8; y++) {
    for (let x = 10; x <= 13; x++) {
      if (x === 10 || x === 13) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 13; // river light
      }
    }
  }

  // Body (round)
  for (let y = 8; y <= 17; y++) {
    for (let x = 7; x <= 16; x++) {
      const dx = x - 11.5;
      const dy = y - 12.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 5) {
        if (dist <= 4.5) {
          grid[y][x] = y < 12 ? 13 : 14; // lighter top, darker bottom
        } else {
          grid[y][x] = 1;
        }
      }
    }
  }

  // Water shine
  grid[10][9] = 4;
  grid[11][9] = 4;
  grid[10][10] = 4;

  return grid;
})();

const waterBombFrame2 = (() => {
  const grid = createEmpty(24, 24);

  // Neck
  for (let y = 6; y <= 8; y++) {
    for (let x = 10; x <= 13; x++) {
      if (x === 10 || x === 13) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 13;
      }
    }
  }

  // Body
  for (let y = 8; y <= 17; y++) {
    for (let x = 7; x <= 16; x++) {
      const dx = x - 11.5;
      const dy = y - 12.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 5) {
        if (dist <= 4.5) {
          grid[y][x] = y < 13 ? 13 : 14; // shifted shading
        } else {
          grid[y][x] = 1;
        }
      }
    }
  }

  // Different shine position
  grid[11][10] = 4;
  grid[12][10] = 4;
  grid[11][11] = 4;

  return grid;
})();

const waterBomb: ProjectilePixelArt = {
  frames: [waterBombFrame1, waterBombFrame2],
  size: 24
};

// Splash effect (32x32) - 3 frames
const splashFrame1 = (() => {
  const grid = createEmpty(32, 32);

  // Initial impact - small splash
  for (let y = 14; y <= 17; y++) {
    for (let x = 14; x <= 17; x++) {
      grid[y][x] = 13; // river light
    }
  }

  // Droplets starting
  grid[12][15] = 14;
  grid[12][16] = 14;
  grid[18][15] = 14;
  grid[18][16] = 14;

  return grid;
})();

const splashFrame2 = (() => {
  const grid = createEmpty(32, 32);

  // Expanding splash
  const splashPixels = [
    [11, 14], [11, 15], [11, 16], [11, 17],
    [12, 13], [12, 14], [12, 17], [12, 18],
    [13, 12], [13, 19],
    [14, 11], [14, 20],
    [15, 11], [15, 20],
    [16, 11], [16, 20],
    [17, 11], [17, 20],
    [18, 12], [18, 19],
    [19, 13], [19, 14], [19, 17], [19, 18],
    [20, 14], [20, 15], [20, 16], [20, 17]
  ];

  for (const [y, x] of splashPixels) {
    grid[y][x] = 13;
  }

  // Flying droplets
  grid[8][15] = 14; grid[8][16] = 14;
  grid[9][13] = 14; grid[9][18] = 14;
  grid[22][13] = 14; grid[22][18] = 14;
  grid[23][15] = 14; grid[23][16] = 14;

  return grid;
})();

const splashFrame3 = (() => {
  const grid = createEmpty(32, 32);

  // Dissipating splash
  const splashPixels = [
    [10, 15], [10, 16],
    [12, 12], [12, 19],
    [14, 10], [14, 21],
    [16, 10], [16, 21],
    [18, 10], [18, 21],
    [20, 12], [20, 19],
    [22, 15], [22, 16]
  ];

  for (const [y, x] of splashPixels) {
    grid[y][x] = 14;
  }

  // Scattered droplets
  grid[6][14] = 14;
  grid[6][17] = 14;
  grid[7][11] = 14;
  grid[7][20] = 14;
  grid[24][11] = 14;
  grid[24][20] = 14;
  grid[25][14] = 14;
  grid[25][17] = 14;

  return grid;
})();

const splashFrames = [splashFrame1, splashFrame2, splashFrame3];

// Explosion effect (32x32) - 3 frames
const explosionFrame1 = (() => {
  const grid = createEmpty(32, 32);

  // Initial burst - bright core
  for (let y = 14; y <= 17; y++) {
    for (let x = 14; x <= 17; x++) {
      grid[y][x] = 4; // white hot
    }
  }

  // First ring
  const ring1 = [
    [13, 14], [13, 15], [13, 16], [13, 17],
    [14, 13], [14, 18],
    [15, 13], [15, 18],
    [16, 13], [16, 18],
    [17, 13], [17, 18],
    [18, 14], [18, 15], [18, 16], [18, 17]
  ];

  for (const [y, x] of ring1) {
    grid[y][x] = 6; // bright
  }

  return grid;
})();

const explosionFrame2 = (() => {
  const grid = createEmpty(32, 32);

  // Expanding explosion
  // Hot core
  for (let y = 13; y <= 18; y++) {
    for (let x = 13; x <= 18; x++) {
      const dx = x - 15.5;
      const dy = y - 15.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 3) {
        grid[y][x] = 4; // white
      } else if (dist <= 4) {
        grid[y][x] = 6; // bright
      }
    }
  }

  // Outer flames
  const flames = [
    [10, 15], [10, 16],
    [11, 13], [11, 18],
    [12, 11], [12, 20],
    [13, 10], [13, 21],
    [18, 10], [18, 21],
    [19, 11], [19, 20],
    [20, 13], [20, 18],
    [21, 15], [21, 16]
  ];

  for (const [y, x] of flames) {
    grid[y][x] = 15; // dark brown/red
  }

  return grid;
})();

const explosionFrame3 = (() => {
  const grid = createEmpty(32, 32);

  // Dissipating explosion - smoke
  const smoke = [
    [8, 15], [8, 16],
    [9, 13], [9, 14], [9, 17], [9, 18],
    [10, 11], [10, 12], [10, 19], [10, 20],
    [11, 9], [11, 22],
    [12, 8], [12, 23],
    [13, 7], [13, 24],
    [18, 7], [18, 24],
    [19, 8], [19, 23],
    [20, 9], [20, 22],
    [21, 11], [21, 12], [21, 19], [21, 20],
    [22, 13], [22, 14], [22, 17], [22, 18],
    [23, 15], [23, 16]
  ];

  for (const [y, x] of smoke) {
    grid[y][x] = 1; // dark outline/smoke
  }

  // Remaining embers
  grid[12][15] = 15;
  grid[13][16] = 15;
  grid[18][15] = 15;
  grid[19][16] = 15;

  return grid;
})();

const explosionFrames = [explosionFrame1, explosionFrame2, explosionFrame3];

export const projectilePixelArt: Record<string, ProjectilePixelArt> = {
  stone,
  arrow,
  dart,
  bomb,
  fireball,
  lightning,
  log,
  waterBomb
};

export const effectPixelArt = {
  splash: splashFrames,
  explosion: explosionFrames
};
