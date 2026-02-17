import type { PixelData } from '@/assets/PixelArtEngine';
import { createEmpty } from '@/assets/PixelArtHelpers';

export interface SoldierPixelArt {
  walk: PixelData[];    // 2-3 frames
  attack: PixelData[];  // 2 frames
}

// Brave Soldier - warrior beaver with small sword (32x32)
const braveSoldierWalk1 = (() => {
  const grid = createEmpty(32, 32);

  // Head (rows 4-14)
  for (let y = 4; y <= 14; y++) {
    const startX = y < 8 ? 10 + (8 - y) : 10;
    const endX = y < 8 ? 21 - (8 - y) : 21;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 4 || y === 14) {
        grid[y][x] = 1; // outline
      } else {
        grid[y][x] = 2; // brown fur
      }
    }
  }

  // Ears
  grid[5][8] = 1; grid[5][9] = 2; grid[5][10] = 1;
  grid[5][21] = 1; grid[5][22] = 2; grid[5][23] = 1;

  // Eyes
  grid[8][12] = 4; grid[8][13] = 5;
  grid[8][18] = 4; grid[8][19] = 5;

  // Teeth
  grid[11][14] = 6; grid[11][15] = 6;
  grid[11][16] = 6; grid[11][17] = 6;

  // Body (rows 14-26)
  for (let y = 14; y <= 26; y++) {
    const startX = 9;
    const endX = 22;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 26) {
        grid[y][x] = 1;
      } else if (x >= 13 && x <= 18 && y >= 16 && y <= 24) {
        grid[y][x] = 3; // cream belly
      } else {
        grid[y][x] = 2;
      }
    }
  }

  // Left arm with sword
  for (let y = 16; y <= 20; y++) {
    grid[y][7] = 2; grid[y][8] = 2;
  }
  // Sword
  for (let y = 12; y <= 18; y++) {
    grid[y][5] = 10; // stone blade
    grid[y][6] = 10;
  }
  grid[19][5] = 8; grid[19][6] = 8; // handle
  grid[11][4] = 9; grid[11][5] = 9; grid[11][6] = 9; grid[11][7] = 9; // crossguard

  // Right arm
  for (let y = 16; y <= 22; y++) {
    grid[y][23] = 2; grid[y][24] = 2;
  }

  // Legs (standing)
  for (let y = 26; y <= 30; y++) {
    grid[y][12] = 2; grid[y][13] = 2; // left leg
    grid[y][18] = 2; grid[y][19] = 2; // right leg
  }
  grid[31][12] = 1; grid[31][13] = 1;
  grid[31][18] = 1; grid[31][19] = 1;

  return grid;
})();

const braveSoldierWalk2 = (() => {
  const grid = createEmpty(32, 32);

  // Copy head from walk1
  for (let y = 4; y <= 14; y++) {
    const startX = y < 8 ? 10 + (8 - y) : 10;
    const endX = y < 8 ? 21 - (8 - y) : 21;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 4 || y === 14) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 2;
      }
    }
  }
  grid[5][8] = 1; grid[5][9] = 2; grid[5][10] = 1;
  grid[5][21] = 1; grid[5][22] = 2; grid[5][23] = 1;
  grid[8][12] = 4; grid[8][13] = 5;
  grid[8][18] = 4; grid[8][19] = 5;
  grid[11][14] = 6; grid[11][15] = 6;
  grid[11][16] = 6; grid[11][17] = 6;

  // Body
  for (let y = 14; y <= 26; y++) {
    for (let x = 9; x <= 22; x++) {
      if (x === 9 || x === 22 || y === 26) {
        grid[y][x] = 1;
      } else if (x >= 13 && x <= 18 && y >= 16 && y <= 24) {
        grid[y][x] = 3;
      } else {
        grid[y][x] = 2;
      }
    }
  }

  // Arms (sword lowered)
  for (let y = 16; y <= 22; y++) {
    grid[y][7] = 2; grid[y][8] = 2;
    grid[y][23] = 2; grid[y][24] = 2;
  }
  for (let y = 20; y <= 24; y++) {
    grid[y][5] = 10; grid[y][6] = 10;
  }
  grid[25][5] = 8; grid[25][6] = 8;

  // Legs (walking - left forward)
  for (let y = 26; y <= 31; y++) {
    grid[y][11] = 2; grid[y][12] = 2; // left leg forward
    grid[y][19] = 2; grid[y][20] = 2; // right leg back
  }

  return grid;
})();

const braveSoldierWalk3 = (() => {
  const grid = createEmpty(32, 32);

  // Copy structure from walk1 but legs different
  for (let y = 4; y <= 14; y++) {
    const startX = y < 8 ? 10 + (8 - y) : 10;
    const endX = y < 8 ? 21 - (8 - y) : 21;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 4 || y === 14) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 2;
      }
    }
  }
  grid[5][8] = 1; grid[5][9] = 2; grid[5][10] = 1;
  grid[5][21] = 1; grid[5][22] = 2; grid[5][23] = 1;
  grid[8][12] = 4; grid[8][13] = 5;
  grid[8][18] = 4; grid[8][19] = 5;
  grid[11][14] = 6; grid[11][15] = 6;
  grid[11][16] = 6; grid[11][17] = 6;

  // Body
  for (let y = 14; y <= 26; y++) {
    for (let x = 9; x <= 22; x++) {
      if (x === 9 || x === 22 || y === 26) {
        grid[y][x] = 1;
      } else if (x >= 13 && x <= 18 && y >= 16 && y <= 24) {
        grid[y][x] = 3;
      } else {
        grid[y][x] = 2;
      }
    }
  }

  // Arms
  for (let y = 16; y <= 22; y++) {
    grid[y][7] = 2; grid[y][8] = 2;
    grid[y][23] = 2; grid[y][24] = 2;
  }
  for (let y = 18; y <= 24; y++) {
    grid[y][5] = 10; grid[y][6] = 10;
  }
  grid[25][5] = 8; grid[25][6] = 8;

  // Legs (walking - right forward)
  for (let y = 26; y <= 31; y++) {
    grid[y][19] = 2; grid[y][20] = 2; // right leg forward
    grid[y][11] = 2; grid[y][12] = 2; // left leg back
  }

  return grid;
})();

const braveSoldierAttack1 = (() => {
  const grid = createEmpty(32, 32);

  // Head
  for (let y = 4; y <= 14; y++) {
    const startX = y < 8 ? 10 + (8 - y) : 10;
    const endX = y < 8 ? 21 - (8 - y) : 21;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 4 || y === 14) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 2;
      }
    }
  }
  grid[5][8] = 1; grid[5][9] = 2; grid[5][10] = 1;
  grid[5][21] = 1; grid[5][22] = 2; grid[5][23] = 1;
  grid[8][12] = 4; grid[8][13] = 5;
  grid[8][18] = 4; grid[8][19] = 5;
  grid[11][14] = 6; grid[11][15] = 6;
  grid[11][16] = 6; grid[11][17] = 6;

  // Body
  for (let y = 14; y <= 26; y++) {
    for (let x = 9; x <= 22; x++) {
      if (x === 9 || x === 22 || y === 26) {
        grid[y][x] = 1;
      } else if (x >= 13 && x <= 18 && y >= 16 && y <= 24) {
        grid[y][x] = 3;
      } else {
        grid[y][x] = 2;
      }
    }
  }

  // Left arm raised with sword
  grid[10][6] = 2; grid[10][7] = 2;
  grid[11][5] = 2; grid[11][6] = 2;
  grid[12][4] = 2; grid[12][5] = 2;

  // Sword raised high
  for (let y = 2; y <= 10; y++) {
    grid[y][2] = 10; grid[y][3] = 10;
  }
  grid[11][2] = 8; grid[11][3] = 8;
  grid[1][1] = 9; grid[1][2] = 9; grid[1][3] = 9; grid[1][4] = 9;

  // Right arm
  for (let y = 16; y <= 22; y++) {
    grid[y][23] = 2; grid[y][24] = 2;
  }

  // Legs
  for (let y = 26; y <= 30; y++) {
    grid[y][12] = 2; grid[y][13] = 2;
    grid[y][18] = 2; grid[y][19] = 2;
  }
  grid[31][12] = 1; grid[31][13] = 1;
  grid[31][18] = 1; grid[31][19] = 1;

  return grid;
})();

const braveSoldierAttack2 = (() => {
  const grid = createEmpty(32, 32);

  // Head
  for (let y = 4; y <= 14; y++) {
    const startX = y < 8 ? 10 + (8 - y) : 10;
    const endX = y < 8 ? 21 - (8 - y) : 21;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 4 || y === 14) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 2;
      }
    }
  }
  grid[5][8] = 1; grid[5][9] = 2; grid[5][10] = 1;
  grid[5][21] = 1; grid[5][22] = 2; grid[5][23] = 1;
  grid[8][12] = 4; grid[8][13] = 5;
  grid[8][18] = 4; grid[8][19] = 5;
  grid[11][14] = 6; grid[11][15] = 6;
  grid[11][16] = 6; grid[11][17] = 6;

  // Body
  for (let y = 14; y <= 26; y++) {
    for (let x = 9; x <= 22; x++) {
      if (x === 9 || x === 22 || y === 26) {
        grid[y][x] = 1;
      } else if (x >= 13 && x <= 18 && y >= 16 && y <= 24) {
        grid[y][x] = 3;
      } else {
        grid[y][x] = 2;
      }
    }
  }

  // Left arm swinging down
  for (let y = 16; y <= 20; y++) {
    grid[y][7] = 2; grid[y][8] = 2;
  }

  // Sword swinging forward
  for (let y = 18; y <= 26; y++) {
    grid[y][3] = 10; grid[y][4] = 10;
  }
  grid[27][3] = 8; grid[27][4] = 8;
  grid[17][2] = 9; grid[17][3] = 9; grid[17][4] = 9; grid[17][5] = 9;

  // Right arm
  for (let y = 16; y <= 22; y++) {
    grid[y][23] = 2; grid[y][24] = 2;
  }

  // Legs
  for (let y = 26; y <= 30; y++) {
    grid[y][12] = 2; grid[y][13] = 2;
    grid[y][18] = 2; grid[y][19] = 2;
  }
  grid[31][12] = 1; grid[31][13] = 1;
  grid[31][18] = 1; grid[31][19] = 1;

  return grid;
})();

const braveSoldier: SoldierPixelArt = {
  walk: [braveSoldierWalk1, braveSoldierWalk2, braveSoldierWalk3],
  attack: [braveSoldierAttack1, braveSoldierAttack2]
};

// Knight Soldier - armored beaver with shield (32x32)
const knightSoldierWalk1 = (() => {
  const grid = createEmpty(32, 32);

  // Helmet with visor (rows 4-14)
  for (let y = 4; y <= 14; y++) {
    const startX = y < 8 ? 10 + (8 - y) : 10;
    const endX = y < 8 ? 21 - (8 - y) : 21;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 4 || y === 14) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 9; // stone armor
      }
    }
  }

  // Visor slit
  for (let x = 12; x <= 19; x++) {
    grid[9][x] = 1;
  }

  // Eyes through visor
  grid[9][14] = 5;
  grid[9][17] = 5;

  // Armored body (rows 14-26)
  for (let y = 14; y <= 26; y++) {
    for (let x = 9; x <= 22; x++) {
      if (x === 9 || x === 22 || y === 26) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 9; // stone armor
      }
    }
  }

  // Shield (left side)
  for (let y = 14; y <= 24; y++) {
    for (let x = 4; x <= 8; x++) {
      if (x === 4 || x === 8 || y === 14 || y === 24) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 10; // darker stone
      }
    }
  }

  // Left arm holding shield
  for (let y = 16; y <= 20; y++) {
    grid[y][7] = 9; grid[y][8] = 9;
  }

  // Right arm
  for (let y = 16; y <= 22; y++) {
    grid[y][23] = 9; grid[y][24] = 9;
  }

  // Legs
  for (let y = 26; y <= 30; y++) {
    grid[y][12] = 9; grid[y][13] = 9;
    grid[y][18] = 9; grid[y][19] = 9;
  }
  grid[31][12] = 1; grid[31][13] = 1;
  grid[31][18] = 1; grid[31][19] = 1;

  return grid;
})();

const knightSoldierWalk2 = (() => {
  const grid = createEmpty(32, 32);

  // Copy helmet
  for (let y = 4; y <= 14; y++) {
    const startX = y < 8 ? 10 + (8 - y) : 10;
    const endX = y < 8 ? 21 - (8 - y) : 21;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 4 || y === 14) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 9;
      }
    }
  }
  for (let x = 12; x <= 19; x++) {
    grid[9][x] = 1;
  }
  grid[9][14] = 5;
  grid[9][17] = 5;

  // Body
  for (let y = 14; y <= 26; y++) {
    for (let x = 9; x <= 22; x++) {
      if (x === 9 || x === 22 || y === 26) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 9;
      }
    }
  }

  // Shield
  for (let y = 14; y <= 24; y++) {
    for (let x = 4; x <= 8; x++) {
      if (x === 4 || x === 8 || y === 14 || y === 24) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 10;
      }
    }
  }

  // Arms
  for (let y = 16; y <= 20; y++) {
    grid[y][7] = 9; grid[y][8] = 9;
    grid[y][23] = 9; grid[y][24] = 9;
  }

  // Legs (walking)
  for (let y = 26; y <= 31; y++) {
    grid[y][11] = 9; grid[y][12] = 9;
    grid[y][19] = 9; grid[y][20] = 9;
  }

  return grid;
})();

const knightSoldierAttack1 = (() => {
  const grid = createEmpty(32, 32);

  // Helmet
  for (let y = 4; y <= 14; y++) {
    const startX = y < 8 ? 10 + (8 - y) : 10;
    const endX = y < 8 ? 21 - (8 - y) : 21;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 4 || y === 14) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 9;
      }
    }
  }
  for (let x = 12; x <= 19; x++) {
    grid[9][x] = 1;
  }
  grid[9][14] = 5;
  grid[9][17] = 5;

  // Body
  for (let y = 14; y <= 26; y++) {
    for (let x = 9; x <= 22; x++) {
      if (x === 9 || x === 22 || y === 26) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 9;
      }
    }
  }

  // Shield raised
  for (let y = 8; y <= 18; y++) {
    for (let x = 3; x <= 7; x++) {
      if (x === 3 || x === 7 || y === 8 || y === 18) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 10;
      }
    }
  }

  // Left arm raised
  grid[10][7] = 9; grid[10][8] = 9;
  grid[11][7] = 9; grid[11][8] = 9;

  // Right arm punching
  grid[16][23] = 9; grid[16][24] = 9;
  grid[17][25] = 9; grid[17][26] = 9;
  grid[18][27] = 9; grid[18][28] = 9;

  // Legs
  for (let y = 26; y <= 30; y++) {
    grid[y][12] = 9; grid[y][13] = 9;
    grid[y][18] = 9; grid[y][19] = 9;
  }
  grid[31][12] = 1; grid[31][13] = 1;
  grid[31][18] = 1; grid[31][19] = 1;

  return grid;
})();

const knightSoldierAttack2 = (() => {
  const grid = createEmpty(32, 32);

  // Helmet
  for (let y = 4; y <= 14; y++) {
    const startX = y < 8 ? 10 + (8 - y) : 10;
    const endX = y < 8 ? 21 - (8 - y) : 21;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 4 || y === 14) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 9;
      }
    }
  }
  for (let x = 12; x <= 19; x++) {
    grid[9][x] = 1;
  }
  grid[9][14] = 5;
  grid[9][17] = 5;

  // Body
  for (let y = 14; y <= 26; y++) {
    for (let x = 9; x <= 22; x++) {
      if (x === 9 || x === 22 || y === 26) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 9;
      }
    }
  }

  // Shield forward
  for (let y = 14; y <= 24; y++) {
    for (let x = 2; x <= 6; x++) {
      if (x === 2 || x === 6 || y === 14 || y === 24) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 10;
      }
    }
  }

  // Arms
  for (let y = 16; y <= 20; y++) {
    grid[y][7] = 9; grid[y][8] = 9;
    grid[y][23] = 9; grid[y][24] = 9;
  }

  // Legs
  for (let y = 26; y <= 30; y++) {
    grid[y][12] = 9; grid[y][13] = 9;
    grid[y][18] = 9; grid[y][19] = 9;
  }
  grid[31][12] = 1; grid[31][13] = 1;
  grid[31][18] = 1; grid[31][19] = 1;

  return grid;
})();

const knightSoldier: SoldierPixelArt = {
  walk: [knightSoldierWalk1, knightSoldierWalk2],
  attack: [knightSoldierAttack1, knightSoldierAttack2]
};

// Barbarian Soldier - big beaver with club (32x32)
const barbarianSoldierWalk1 = (() => {
  const grid = createEmpty(32, 32);

  // Head (larger, darker fur)
  for (let y = 3; y <= 15; y++) {
    const startX = y < 7 ? 9 + (7 - y) : 9;
    const endX = y < 7 ? 22 - (7 - y) : 22;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 3 || y === 15) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 15; // dark brown
      }
    }
  }

  // Wild ears
  grid[4][6] = 1; grid[4][7] = 15; grid[4][8] = 1;
  grid[4][23] = 1; grid[4][24] = 15; grid[4][25] = 1;

  // Angry eyes
  grid[8][11] = 5; grid[8][12] = 5;
  grid[8][19] = 5; grid[8][20] = 5;

  // Teeth
  grid[12][13] = 6; grid[12][14] = 6;
  grid[12][17] = 6; grid[12][18] = 6;

  // Large body (rows 15-28)
  for (let y = 15; y <= 28; y++) {
    for (let x = 8; x <= 23; x++) {
      if (x === 8 || x === 23 || y === 28) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 15; // dark brown
      }
    }
  }

  // Left arm with club
  for (let y = 16; y <= 22; y++) {
    grid[y][5] = 15; grid[y][6] = 15; grid[y][7] = 15;
  }

  // Club
  for (let y = 10; y <= 18; y++) {
    grid[y][3] = 8; grid[y][4] = 8;
  }
  // Club head (larger)
  for (let y = 8; y <= 11; y++) {
    for (let x = 2; x <= 5; x++) {
      grid[y][x] = 8;
    }
  }

  // Right arm
  for (let y = 16; y <= 24; y++) {
    grid[y][24] = 15; grid[y][25] = 15; grid[y][26] = 15;
  }

  // Thick legs
  for (let y = 28; y <= 31; y++) {
    grid[y][11] = 15; grid[y][12] = 15; grid[y][13] = 15;
    grid[y][18] = 15; grid[y][19] = 15; grid[y][20] = 15;
  }

  return grid;
})();

const barbarianSoldierWalk2 = (() => {
  const grid = createEmpty(32, 32);

  // Head
  for (let y = 3; y <= 15; y++) {
    const startX = y < 7 ? 9 + (7 - y) : 9;
    const endX = y < 7 ? 22 - (7 - y) : 22;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 3 || y === 15) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 15;
      }
    }
  }
  grid[4][6] = 1; grid[4][7] = 15; grid[4][8] = 1;
  grid[4][23] = 1; grid[4][24] = 15; grid[4][25] = 1;
  grid[8][11] = 5; grid[8][12] = 5;
  grid[8][19] = 5; grid[8][20] = 5;
  grid[12][13] = 6; grid[12][14] = 6;
  grid[12][17] = 6; grid[12][18] = 6;

  // Body
  for (let y = 15; y <= 28; y++) {
    for (let x = 8; x <= 23; x++) {
      if (x === 8 || x === 23 || y === 28) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 15;
      }
    }
  }

  // Arms
  for (let y = 16; y <= 22; y++) {
    grid[y][5] = 15; grid[y][6] = 15; grid[y][7] = 15;
    grid[y][24] = 15; grid[y][25] = 15; grid[y][26] = 15;
  }

  // Club lower
  for (let y = 18; y <= 26; y++) {
    grid[y][3] = 8; grid[y][4] = 8;
  }
  for (let y = 16; y <= 19; y++) {
    for (let x = 2; x <= 5; x++) {
      grid[y][x] = 8;
    }
  }

  // Legs (walking)
  for (let y = 28; y <= 31; y++) {
    grid[y][10] = 15; grid[y][11] = 15; grid[y][12] = 15;
    grid[y][19] = 15; grid[y][20] = 15; grid[y][21] = 15;
  }

  return grid;
})();

const barbarianSoldierAttack1 = (() => {
  const grid = createEmpty(32, 32);

  // Head
  for (let y = 3; y <= 15; y++) {
    const startX = y < 7 ? 9 + (7 - y) : 9;
    const endX = y < 7 ? 22 - (7 - y) : 22;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 3 || y === 15) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 15;
      }
    }
  }
  grid[4][6] = 1; grid[4][7] = 15; grid[4][8] = 1;
  grid[4][23] = 1; grid[4][24] = 15; grid[4][25] = 1;
  grid[8][11] = 5; grid[8][12] = 5;
  grid[8][19] = 5; grid[8][20] = 5;
  grid[12][13] = 6; grid[12][14] = 6;
  grid[12][17] = 6; grid[12][18] = 6;

  // Body
  for (let y = 15; y <= 28; y++) {
    for (let x = 8; x <= 23; x++) {
      if (x === 8 || x === 23 || y === 28) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 15;
      }
    }
  }

  // Left arm raised with club
  grid[8][4] = 15; grid[8][5] = 15; grid[8][6] = 15;
  grid[9][3] = 15; grid[9][4] = 15; grid[9][5] = 15;
  grid[10][2] = 15; grid[10][3] = 15; grid[10][4] = 15;

  // Club raised high
  for (let y = 0; y <= 8; y++) {
    grid[y][0] = 8; grid[y][1] = 8;
  }
  for (let y = 0; y <= 3; y++) {
    for (let x = 0; x <= 3; x++) {
      grid[y][x] = 8;
    }
  }

  // Right arm
  for (let y = 16; y <= 24; y++) {
    grid[y][24] = 15; grid[y][25] = 15; grid[y][26] = 15;
  }

  // Legs
  for (let y = 28; y <= 31; y++) {
    grid[y][11] = 15; grid[y][12] = 15; grid[y][13] = 15;
    grid[y][18] = 15; grid[y][19] = 15; grid[y][20] = 15;
  }

  return grid;
})();

const barbarianSoldierAttack2 = (() => {
  const grid = createEmpty(32, 32);

  // Head
  for (let y = 3; y <= 15; y++) {
    const startX = y < 7 ? 9 + (7 - y) : 9;
    const endX = y < 7 ? 22 - (7 - y) : 22;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 3 || y === 15) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 15;
      }
    }
  }
  grid[4][6] = 1; grid[4][7] = 15; grid[4][8] = 1;
  grid[4][23] = 1; grid[4][24] = 15; grid[4][25] = 1;
  grid[8][11] = 5; grid[8][12] = 5;
  grid[8][19] = 5; grid[8][20] = 5;
  grid[12][13] = 6; grid[12][14] = 6;
  grid[12][17] = 6; grid[12][18] = 6;

  // Body
  for (let y = 15; y <= 28; y++) {
    for (let x = 8; x <= 23; x++) {
      if (x === 8 || x === 23 || y === 28) {
        grid[y][x] = 1;
      } else {
        grid[y][x] = 15;
      }
    }
  }

  // Left arm swinging down
  for (let y = 16; y <= 24; y++) {
    grid[y][4] = 15; grid[y][5] = 15; grid[y][6] = 15;
  }

  // Club smashing down
  for (let y = 20; y <= 30; y++) {
    grid[y][1] = 8; grid[y][2] = 8;
  }
  for (let y = 26; y <= 30; y++) {
    for (let x = 0; x <= 3; x++) {
      grid[y][x] = 8;
    }
  }

  // Right arm
  for (let y = 16; y <= 24; y++) {
    grid[y][24] = 15; grid[y][25] = 15; grid[y][26] = 15;
  }

  // Legs
  for (let y = 28; y <= 31; y++) {
    grid[y][11] = 15; grid[y][12] = 15; grid[y][13] = 15;
    grid[y][18] = 15; grid[y][19] = 15; grid[y][20] = 15;
  }

  return grid;
})();

const barbarianSoldier: SoldierPixelArt = {
  walk: [barbarianSoldierWalk1, barbarianSoldierWalk2],
  attack: [barbarianSoldierAttack1, barbarianSoldierAttack2]
};

export const soldierPixelArt: Record<string, SoldierPixelArt> = {
  brave: braveSoldier,
  knight: knightSoldier,
  barbarian: barbarianSoldier
};
