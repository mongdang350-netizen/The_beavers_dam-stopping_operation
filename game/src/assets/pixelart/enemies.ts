import type { PixelData } from '@/assets/PixelArtEngine';
import { createEmpty } from '@/assets/PixelArtHelpers';

export interface EnemyPixelArt {
  walk: PixelData[];
  attack: PixelData[];
}

// Helper to create cute animal eyes
function addEyes(grid: number[][], leftX: number, rightX: number, y: number): void {
  // Left eye
  grid[y][leftX] = 4; // white
  grid[y][leftX + 1] = 4;
  grid[y + 1][leftX] = 4;
  grid[y + 1][leftX + 1] = 4;
  // Left pupil
  grid[y][leftX] = 5; // black
  grid[y + 1][leftX] = 5;

  // Right eye
  grid[y][rightX] = 4;
  grid[y][rightX + 1] = 4;
  grid[y + 1][rightX] = 4;
  grid[y + 1][rightX + 1] = 4;
  // Right pupil
  grid[y][rightX + 1] = 5;
  grid[y + 1][rightX + 1] = 5;
}

// === PIRANHA (48x48) ===
function createPiranha(): EnemyPixelArt {
  const walk1 = createEmpty(48, 48);

  // Body (green, round fish shape)
  for (let y = 16; y <= 32; y++) {
    const width = 12 - Math.abs(y - 24) / 2;
    const startX = Math.floor(24 - width);
    const endX = Math.floor(24 + width);

    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 16 || y === 32) {
        walk1[y][x] = 1; // outline
      } else {
        walk1[y][x] = 11; // green body
      }
    }
  }

  // Big eyes
  addEyes(walk1, 18, 26, 20);

  // Dorsal fin (top)
  for (let y = 12; y <= 16; y++) {
    for (let x = 22; x <= 26; x++) {
      if (y === 12 || x === 22 || x === 26) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 16; // fire red fin
      }
    }
  }

  // Tail fin
  for (let y = 20; y <= 28; y++) {
    for (let x = 32; x <= 36; x++) {
      if (x === 32 || x === 36 || y === 20 || y === 28) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 16; // fire red
      }
    }
  }

  // Sharp teeth (bottom jaw)
  walk1[28][20] = 6;
  walk1[28][22] = 6;
  walk1[28][24] = 6;
  walk1[28][26] = 6;

  // Walk frame 2: tail moved
  const walk2 = walk1.map(row => [...row]);
  // Shift tail slightly
  for (let y = 20; y <= 28; y++) {
    for (let x = 32; x <= 36; x++) {
      walk2[y][x] = 0;
    }
    for (let x = 33; x <= 37; x++) {
      if (x === 33 || x === 37 || y === 20 || y === 28) {
        walk2[y][x] = 1;
      } else {
        walk2[y][x] = 16; // fire red
      }
    }
  }

  // Attack frame 1: mouth closed
  const attack1 = walk1.map(row => [...row]);

  // Attack frame 2: mouth open wide
  const attack2 = createEmpty(48, 48);
  // Upper jaw
  for (let y = 16; y <= 23; y++) {
    const width = 10 - Math.abs(y - 19.5) / 2;
    const startX = Math.floor(24 - width);
    const endX = Math.floor(24 + width);

    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 16) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 11;
      }
    }
  }

  // Lower jaw (open)
  for (let y = 25; y <= 32; y++) {
    const width = 10 - Math.abs(y - 28.5) / 2;
    const startX = Math.floor(24 - width);
    const endX = Math.floor(24 + width);

    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 32) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 11;
      }
    }
  }

  // Eyes on attack
  addEyes(attack2, 18, 26, 18);

  // Teeth everywhere
  for (let x = 16; x <= 30; x += 2) {
    attack2[23][x] = 6; // upper teeth
    attack2[25][x] = 6; // lower teeth
  }

  return {
    walk: [walk1, walk2] as const,
    attack: [attack1, attack2] as const,
  };
}

// === CATFISH (48x48) ===
function createCatfish(): EnemyPixelArt {
  const walk1 = createEmpty(48, 48);

  // Body (brown, elongated)
  for (let y = 18; y <= 30; y++) {
    for (let x = 12; x <= 32; x++) {
      if (y === 18 || y === 30 || x === 12 || x === 32) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 2; // brown
      }
    }
  }

  // Belly lighter
  for (let y = 22; y <= 26; y++) {
    for (let x = 14; x <= 30; x++) {
      if (walk1[y][x] === 2) {
        walk1[y][x] = 28; // warm brown
      }
    }
  }

  // Eyes
  addEyes(walk1, 16, 24, 20);

  // Whiskers (barbels)
  walk1[22][10] = 1;
  walk1[22][11] = 1;
  walk1[23][9] = 1;
  walk1[23][10] = 1;
  walk1[26][10] = 1;
  walk1[26][11] = 1;
  walk1[27][9] = 1;
  walk1[27][10] = 1;

  // Tail
  for (let y = 20; y <= 28; y++) {
    for (let x = 32; x <= 38; x++) {
      if (y === 20 || y === 28 || x === 38) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 2;
      }
    }
  }

  // Walk frame 2
  const walk2 = walk1.map(row => [...row]);
  // Wiggle tail
  for (let y = 20; y <= 28; y++) {
    for (let x = 32; x <= 38; x++) {
      walk2[y][x] = 0;
    }
    const offset = (y < 24) ? 1 : -1;
    for (let x = 32; x <= 38; x++) {
      const ny = y + offset;
      if (ny >= 20 && ny <= 28) {
        if (ny === 20 || ny === 28 || x === 38) {
          walk2[ny][x] = 1;
        } else {
          walk2[ny][x] = 2;
        }
      }
    }
  }

  // Attack frame 1
  const attack1 = walk1.map(row => [...row]);

  // Attack frame 2: swipe motion (fins extended)
  const attack2 = walk1.map(row => [...row]);
  // Top fin extended
  for (let y = 14; y <= 18; y++) {
    for (let x = 20; x <= 28; x++) {
      if (y === 14 || x === 20 || x === 28) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 2;
      }
    }
  }

  return {
    walk: [walk1, walk2] as const,
    attack: [attack1, attack2] as const,
  };
}

// === IGUANA (48x48) ===
function createIguana(): EnemyPixelArt {
  const walk1 = createEmpty(48, 48);

  // Body (green lizard)
  for (let y = 20; y <= 32; y++) {
    for (let x = 10; x <= 30; x++) {
      if (y === 20 || y === 32 || x === 10 || x === 30) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 11; // green
      }
    }
  }

  // Head
  for (let y = 14; y <= 24; y++) {
    for (let x = 26; x <= 36; x++) {
      if (y === 14 || y === 24 || x === 26 || x === 36) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 12; // dark green
      }
    }
  }

  // Eyes
  addEyes(walk1, 30, 33, 16);

  // Spikes on back
  for (let x = 12; x <= 28; x += 4) {
    walk1[18][x] = 1;
    walk1[19][x] = 1;
    walk1[20][x] = 1;
  }

  // Tail
  for (let y = 24; y <= 28; y++) {
    for (let x = 6; x <= 10; x++) {
      if (y === 24 || y === 28 || x === 6) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 11;
      }
    }
  }

  // Legs (frame 1)
  // Front leg
  for (let y = 32; y <= 38; y++) {
    walk1[y][28] = 1;
    walk1[y][29] = 11;
    walk1[y][30] = 1;
  }
  // Back leg
  for (let y = 32; y <= 38; y++) {
    walk1[y][14] = 1;
    walk1[y][15] = 11;
    walk1[y][16] = 1;
  }

  // Walk frame 2: legs moved
  const walk2 = walk1.map(row => [...row]);
  // Clear old legs
  for (let y = 32; y <= 38; y++) {
    walk2[y][28] = 0;
    walk2[y][29] = 0;
    walk2[y][30] = 0;
    walk2[y][14] = 0;
    walk2[y][15] = 0;
    walk2[y][16] = 0;
  }
  // New positions
  for (let y = 32; y <= 38; y++) {
    walk2[y][26] = 1;
    walk2[y][27] = 11;
    walk2[y][28] = 1;
    walk2[y][16] = 1;
    walk2[y][17] = 11;
    walk2[y][18] = 1;
  }

  // Attack 1
  const attack1 = walk1.map(row => [...row]);

  // Attack 2: tongue out
  const attack2 = walk1.map(row => [...row]);
  // Long tongue
  for (let x = 36; x <= 44; x++) {
    attack2[18][x] = 25; // salmon (realistic tongue color)
    attack2[19][x] = 25;
  }
  attack2[18][44] = 1;
  attack2[19][44] = 1;

  return {
    walk: [walk1, walk2] as const,
    attack: [attack1, attack2] as const,
  };
}

// === WATER SNAKE (48x48) ===
function createWaterSnake(): EnemyPixelArt {
  const walk1 = createEmpty(48, 48);

  // Serpentine body (blue)
  const bodySegments = [
    { x: 10, y: 20 },
    { x: 14, y: 18 },
    { x: 18, y: 20 },
    { x: 22, y: 22 },
    { x: 26, y: 20 },
    { x: 30, y: 18 },
    { x: 34, y: 20 },
  ];

  for (const seg of bodySegments) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const y = seg.y + dy;
        const x = seg.x + dx;
        if (Math.abs(dy) === 2 || Math.abs(dx) === 2) {
          walk1[y][x] = 1; // outline
        } else {
          // Add teal accents to some body pixels
          walk1[y][x] = (dx + dy) % 3 === 0 ? 22 : 13; // teal accents
        }
      }
    }
  }

  // Head (larger)
  for (let y = 16; y <= 24; y++) {
    for (let x = 32; x <= 40; x++) {
      if (y === 16 || y === 24 || x === 32 || x === 40) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 14; // dark blue
      }
    }
  }

  // Eyes on head
  addEyes(walk1, 35, 37, 18);

  // Walk frame 2: wave shifted
  const walk2 = createEmpty(48, 48);
  const bodySegments2 = [
    { x: 10, y: 22 },
    { x: 14, y: 20 },
    { x: 18, y: 18 },
    { x: 22, y: 20 },
    { x: 26, y: 22 },
    { x: 30, y: 20 },
    { x: 34, y: 18 },
  ];

  for (const seg of bodySegments2) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const y = seg.y + dy;
        const x = seg.x + dx;
        if (Math.abs(dy) === 2 || Math.abs(dx) === 2) {
          walk2[y][x] = 1;
        } else {
          walk2[y][x] = 13;
        }
      }
    }
  }

  // Head for walk2
  for (let y = 14; y <= 22; y++) {
    for (let x = 32; x <= 40; x++) {
      if (y === 14 || y === 22 || x === 32 || x === 40) {
        walk2[y][x] = 1;
      } else {
        walk2[y][x] = 14;
      }
    }
  }
  addEyes(walk2, 35, 37, 16);

  // Walk frame 3
  const walk3 = createEmpty(48, 48);
  const bodySegments3 = [
    { x: 10, y: 18 },
    { x: 14, y: 22 },
    { x: 18, y: 22 },
    { x: 22, y: 18 },
    { x: 26, y: 18 },
    { x: 30, y: 22 },
    { x: 34, y: 22 },
  ];

  for (const seg of bodySegments3) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const y = seg.y + dy;
        const x = seg.x + dx;
        if (Math.abs(dy) === 2 || Math.abs(dx) === 2) {
          walk3[y][x] = 1;
        } else {
          walk3[y][x] = 13;
        }
      }
    }
  }

  // Head for walk3
  for (let y = 18; y <= 26; y++) {
    for (let x = 32; x <= 40; x++) {
      if (y === 18 || y === 26 || x === 32 || x === 40) {
        walk3[y][x] = 1;
      } else {
        walk3[y][x] = 14;
      }
    }
  }
  addEyes(walk3, 35, 37, 20);

  // Attack 1: coiled
  const attack1 = walk1.map(row => [...row]);

  // Attack 2: strike forward
  const attack2 = createEmpty(48, 48);
  // Extended body
  for (let x = 8; x <= 42; x++) {
    for (let y = 20; y <= 28; y++) {
      if (y === 20 || y === 28) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 13;
      }
    }
  }
  // Head striking
  for (let y = 18; y <= 30; y++) {
    for (let x = 38; x <= 46; x++) {
      if (y === 18 || y === 30 || x === 46) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 14;
      }
    }
  }
  addEyes(attack2, 40, 42, 22);
  // Fangs
  attack2[26][42] = 6;
  attack2[26][44] = 6;

  return {
    walk: [walk1, walk2, walk3] as const,
    attack: [attack1, attack2] as const,
  };
}

// === TURTLE (48x48) ===
function createTurtle(): EnemyPixelArt {
  const walk1 = createEmpty(48, 48);

  // Shell (green dome)
  for (let y = 14; y <= 30; y++) {
    const width = 14 - Math.abs(y - 22) / 1.5;
    const startX = Math.floor(24 - width);
    const endX = Math.floor(24 + width);

    for (let x = startX; x <= endX; x++) {
      if (y === 14 || x === startX || x === endX) {
        walk1[y][x] = 1; // outline
      } else {
        walk1[y][x] = 11; // green shell
      }
    }
  }

  // Shell pattern
  for (let y = 18; y <= 26; y += 4) {
    for (let x = 18; x <= 30; x += 4) {
      if (walk1[y][x] === 11) {
        walk1[y][x] = 12; // darker green
      }
    }
  }

  // Head (brown)
  for (let y = 18; y <= 26; y++) {
    for (let x = 34; x <= 42; x++) {
      if (y === 18 || y === 26 || x === 42) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 2; // brown
      }
    }
  }

  // Eyes
  addEyes(walk1, 36, 39, 20);

  // Legs (frame 1)
  // Front left leg
  for (let y = 28; y <= 34; y++) {
    walk1[y][18] = 1;
    walk1[y][19] = 2;
    walk1[y][20] = 1;
  }
  // Front right leg
  for (let y = 28; y <= 34; y++) {
    walk1[y][28] = 1;
    walk1[y][29] = 2;
    walk1[y][30] = 1;
  }

  // Walk frame 2: legs moved
  const walk2 = walk1.map(row => [...row]);
  for (let y = 28; y <= 34; y++) {
    walk2[y][18] = 0;
    walk2[y][19] = 0;
    walk2[y][20] = 0;
    walk2[y][28] = 0;
    walk2[y][29] = 0;
    walk2[y][30] = 0;
  }
  for (let y = 28; y <= 34; y++) {
    walk2[y][16] = 1;
    walk2[y][17] = 2;
    walk2[y][18] = 1;
    walk2[y][30] = 1;
    walk2[y][31] = 2;
    walk2[y][32] = 1;
  }

  // Attack 1
  const attack1 = walk1.map(row => [...row]);

  // Attack 2: head extended forward
  const attack2 = createEmpty(48, 48);
  // Shell (same)
  for (let y = 14; y <= 30; y++) {
    const width = 14 - Math.abs(y - 22) / 1.5;
    const startX = Math.floor(24 - width);
    const endX = Math.floor(24 + width);

    for (let x = startX; x <= endX; x++) {
      if (y === 14 || x === startX || x === endX) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 11;
      }
    }
  }

  // Shell pattern
  for (let y = 18; y <= 26; y += 4) {
    for (let x = 18; x <= 30; x += 4) {
      if (attack2[y][x] === 11) {
        attack2[y][x] = 12;
      }
    }
  }

  // Head extended more
  for (let y = 18; y <= 26; y++) {
    for (let x = 36; x <= 46; x++) {
      if (y === 18 || y === 26 || x === 46) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 2;
      }
    }
  }
  addEyes(attack2, 38, 42, 20);

  // Legs
  for (let y = 28; y <= 34; y++) {
    attack2[y][18] = 1;
    attack2[y][19] = 2;
    attack2[y][20] = 1;
    attack2[y][28] = 1;
    attack2[y][29] = 2;
    attack2[y][30] = 1;
  }

  return {
    walk: [walk1, walk2] as const,
    attack: [attack1, attack2] as const,
  };
}

// === ANACONDA BOSS (72x72) ===
function createAnaconda(): EnemyPixelArt {
  const walk1 = createEmpty(72, 72);

  // Large serpentine body (red/pink pattern)
  const bodySegments = [
    { x: 12, y: 30 },
    { x: 20, y: 26 },
    { x: 28, y: 30 },
    { x: 36, y: 34 },
    { x: 44, y: 30 },
    { x: 52, y: 26 },
  ];

  for (const seg of bodySegments) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const y = seg.y + dy;
        const x = seg.x + dx;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 4 && dist > 3) {
          walk1[y][x] = 1; // outline
        } else if (dist <= 3) {
          // Pattern: rust body with salmon spots
          if ((Math.abs(dx) + Math.abs(dy)) % 3 === 0) {
            walk1[y][x] = 25; // salmon pattern
          } else {
            walk1[y][x] = 27; // rust body
          }
        }
      }
    }
  }

  // Large head
  for (let y = 20; y <= 36; y++) {
    for (let x = 48; x <= 64; x++) {
      if (y === 20 || y === 36 || x === 48 || x === 64) {
        walk1[y][x] = 1;
      } else {
        if ((x + y) % 3 === 0) {
          walk1[y][x] = 25; // salmon
        } else {
          walk1[y][x] = 27; // rust
        }
      }
    }
  }

  // Big eyes
  for (let y = 24; y <= 28; y++) {
    for (let x = 52; x <= 56; x++) {
      walk1[y][x] = 4;
    }
    for (let x = 58; x <= 62; x++) {
      walk1[y][x] = 4;
    }
  }
  walk1[25][53] = 5;
  walk1[25][54] = 5;
  walk1[26][53] = 5;
  walk1[26][54] = 5;
  walk1[25][60] = 5;
  walk1[25][61] = 5;
  walk1[26][60] = 5;
  walk1[26][61] = 5;

  // Walk frame 2
  const walk2 = createEmpty(72, 72);
  const bodySegments2 = [
    { x: 12, y: 34 },
    { x: 20, y: 30 },
    { x: 28, y: 26 },
    { x: 36, y: 30 },
    { x: 44, y: 34 },
    { x: 52, y: 30 },
  ];

  for (const seg of bodySegments2) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const y = seg.y + dy;
        const x = seg.x + dx;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 4 && dist > 3) {
          walk2[y][x] = 1;
        } else if (dist <= 3) {
          if ((Math.abs(dx) + Math.abs(dy)) % 3 === 0) {
            walk2[y][x] = 25; // salmon
          } else {
            walk2[y][x] = 27; // rust
          }
        }
      }
    }
  }

  // Head for walk2
  for (let y = 24; y <= 40; y++) {
    for (let x = 48; x <= 64; x++) {
      if (y === 24 || y === 40 || x === 48 || x === 64) {
        walk2[y][x] = 1;
      } else {
        if ((x + y) % 3 === 0) {
          walk2[y][x] = 25; // salmon
        } else {
          walk2[y][x] = 27; // rust
        }
      }
    }
  }

  for (let y = 28; y <= 32; y++) {
    for (let x = 52; x <= 56; x++) {
      walk2[y][x] = 4;
    }
    for (let x = 58; x <= 62; x++) {
      walk2[y][x] = 4;
    }
  }
  walk2[29][53] = 5;
  walk2[29][54] = 5;
  walk2[30][53] = 5;
  walk2[30][54] = 5;
  walk2[29][60] = 5;
  walk2[29][61] = 5;
  walk2[30][60] = 5;
  walk2[30][61] = 5;

  // Walk frame 3
  const walk3 = createEmpty(72, 72);
  const bodySegments3 = [
    { x: 12, y: 26 },
    { x: 20, y: 34 },
    { x: 28, y: 34 },
    { x: 36, y: 26 },
    { x: 44, y: 26 },
    { x: 52, y: 34 },
  ];

  for (const seg of bodySegments3) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const y = seg.y + dy;
        const x = seg.x + dx;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 4 && dist > 3) {
          walk3[y][x] = 1;
        } else if (dist <= 3) {
          if ((Math.abs(dx) + Math.abs(dy)) % 3 === 0) {
            walk3[y][x] = 25; // salmon
          } else {
            walk3[y][x] = 27; // rust
          }
        }
      }
    }
  }

  // Head for walk3
  for (let y = 18; y <= 34; y++) {
    for (let x = 48; x <= 64; x++) {
      if (y === 18 || y === 34 || x === 48 || x === 64) {
        walk3[y][x] = 1;
      } else {
        if ((x + y) % 3 === 0) {
          walk3[y][x] = 25; // salmon
        } else {
          walk3[y][x] = 27; // rust
        }
      }
    }
  }

  for (let y = 22; y <= 26; y++) {
    for (let x = 52; x <= 56; x++) {
      walk3[y][x] = 4;
    }
    for (let x = 58; x <= 62; x++) {
      walk3[y][x] = 4;
    }
  }
  walk3[23][53] = 5;
  walk3[23][54] = 5;
  walk3[24][53] = 5;
  walk3[24][54] = 5;
  walk3[23][60] = 5;
  walk3[23][61] = 5;
  walk3[24][60] = 5;
  walk3[24][61] = 5;

  // Attack 1
  const attack1 = walk1.map(row => [...row]);

  // Attack 2: coiled around (constrict pose)
  const attack2 = createEmpty(72, 72);
  // Spiral coils
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    const radius = 20 + (angle / 360) * 8;
    const cx = 36 + Math.cos(rad) * radius;
    const cy = 36 + Math.sin(rad) * radius;

    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const y = Math.floor(cy + dy);
        const x = Math.floor(cx + dx);
        if (y >= 0 && y < 72 && x >= 0 && x < 72) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= 3 && dist > 2) {
            attack2[y][x] = 1;
          } else if (dist <= 2) {
            if ((Math.abs(dx) + Math.abs(dy)) % 2 === 0) {
              attack2[y][x] = 25; // salmon
            } else {
              attack2[y][x] = 27; // rust
            }
          }
        }
      }
    }
  }

  // Head in center
  for (let y = 32; y <= 40; y++) {
    for (let x = 32; x <= 40; x++) {
      if (y === 32 || y === 40 || x === 32 || x === 40) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 27; // rust
      }
    }
  }
  addEyes(attack2, 34, 37, 34);

  return {
    walk: [walk1, walk2, walk3] as const,
    attack: [attack1, attack2] as const,
  };
}

// === CROCODILE (48x48) ===
function createCrocodile(): EnemyPixelArt {
  const walk1 = createEmpty(48, 48);

  // Body (dark green)
  for (let y = 18; y <= 30; y++) {
    for (let x = 8; x <= 36; x++) {
      if (y === 18 || y === 30 || x === 8 || x === 36) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 12; // dark green
      }
    }
  }

  // Lighter belly
  for (let y = 24; y <= 28; y++) {
    for (let x = 10; x <= 34; x++) {
      if (walk1[y][x] === 12) {
        walk1[y][x] = 11; // light green
      }
    }
  }

  // Snout (long)
  for (let y = 20; y <= 28; y++) {
    for (let x = 36; x <= 44; x++) {
      if (y === 20 || y === 28 || x === 44) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 12;
      }
    }
  }

  // Eyes on top of head
  walk1[18][30] = 4;
  walk1[18][31] = 4;
  walk1[19][30] = 4;
  walk1[19][31] = 4;
  walk1[18][30] = 5;
  walk1[19][30] = 5;

  walk1[18][33] = 4;
  walk1[18][34] = 4;
  walk1[19][33] = 4;
  walk1[19][34] = 4;
  walk1[18][34] = 5;
  walk1[19][34] = 5;

  // Legs (frame 1)
  for (let y = 30; y <= 36; y++) {
    walk1[y][12] = 1;
    walk1[y][13] = 12;
    walk1[y][14] = 1;
    walk1[y][24] = 1;
    walk1[y][25] = 12;
    walk1[y][26] = 1;
  }

  // Tail
  for (let y = 22; y <= 26; y++) {
    for (let x = 4; x <= 8; x++) {
      if (x === 4 || y === 22 || y === 26) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 12;
      }
    }
  }

  // Walk frame 2
  const walk2 = walk1.map(row => [...row]);
  for (let y = 30; y <= 36; y++) {
    walk2[y][12] = 0;
    walk2[y][13] = 0;
    walk2[y][14] = 0;
    walk2[y][24] = 0;
    walk2[y][25] = 0;
    walk2[y][26] = 0;
  }
  for (let y = 30; y <= 36; y++) {
    walk2[y][14] = 1;
    walk2[y][15] = 12;
    walk2[y][16] = 1;
    walk2[y][22] = 1;
    walk2[y][23] = 12;
    walk2[y][24] = 1;
  }

  // Walk frame 3
  const walk3 = walk1.map(row => [...row]);
  for (let y = 30; y <= 36; y++) {
    walk3[y][12] = 0;
    walk3[y][13] = 0;
    walk3[y][14] = 0;
    walk3[y][24] = 0;
    walk3[y][25] = 0;
    walk3[y][26] = 0;
  }
  for (let y = 30; y <= 36; y++) {
    walk3[y][10] = 1;
    walk3[y][11] = 12;
    walk3[y][12] = 1;
    walk3[y][26] = 1;
    walk3[y][27] = 12;
    walk3[y][28] = 1;
  }

  // Attack 1
  const attack1 = walk1.map(row => [...row]);

  // Attack 2: jaws open
  const attack2 = createEmpty(48, 48);
  // Body
  for (let y = 18; y <= 30; y++) {
    for (let x = 8; x <= 36; x++) {
      if (y === 18 || y === 30 || x === 8 || x === 36) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 12;
      }
    }
  }

  // Upper jaw
  for (let y = 16; y <= 22; y++) {
    for (let x = 36; x <= 44; x++) {
      if (y === 16 || x === 44) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 12;
      }
    }
  }

  // Lower jaw
  for (let y = 26; y <= 32; y++) {
    for (let x = 36; x <= 44; x++) {
      if (y === 32 || x === 44) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 12;
      }
    }
  }

  // Teeth
  for (let x = 38; x <= 42; x += 2) {
    attack2[22][x] = 6;
    attack2[26][x] = 6;
  }

  // Eyes
  attack2[16][30] = 4;
  attack2[16][31] = 4;
  attack2[17][30] = 4;
  attack2[17][31] = 4;
  attack2[16][30] = 5;
  attack2[17][30] = 5;

  // Legs
  for (let y = 30; y <= 36; y++) {
    attack2[y][12] = 1;
    attack2[y][13] = 12;
    attack2[y][14] = 1;
    attack2[y][24] = 1;
    attack2[y][25] = 12;
    attack2[y][26] = 1;
  }

  return {
    walk: [walk1, walk2, walk3] as const,
    attack: [attack1, attack2] as const,
  };
}

// === HIPPO (48x48) ===
function createHippo(): EnemyPixelArt {
  const walk1 = createEmpty(48, 48);

  // Body (purple-ish using stone colors)
  for (let y = 16; y <= 34; y++) {
    for (let x = 8; x <= 38; x++) {
      if (y === 16 || y === 34 || x === 8 || x === 38) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 10; // stone dark (purple-ish)
      }
    }
  }

  // Belly lighter
  for (let y = 26; y <= 32; y++) {
    for (let x = 12; x <= 34; x++) {
      if (walk1[y][x] === 10) {
        walk1[y][x] = 9; // stone light
      }
    }
  }

  // Big round head
  for (let y = 14; y <= 26; y++) {
    for (let x = 28; x <= 42; x++) {
      if (y === 14 || y === 26 || x === 28 || x === 42) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 10;
      }
    }
  }

  // Snout bump
  for (let y = 22; y <= 26; y++) {
    for (let x = 40; x <= 44; x++) {
      if (y === 22 || x === 44) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 25; // salmon (pink nose)
      }
    }
  }

  // Eyes
  addEyes(walk1, 32, 36, 16);

  // Ears
  for (let y = 12; y <= 14; y++) {
    for (let x = 30; x <= 34; x++) {
      walk1[y][x] = 1;
    }
  }
  for (let y = 12; y <= 14; y++) {
    for (let x = 38; x <= 42; x++) {
      walk1[y][x] = 1;
    }
  }

  // Legs (frame 1)
  for (let y = 34; y <= 42; y++) {
    walk1[y][14] = 1;
    walk1[y][15] = 10;
    walk1[y][16] = 1;
    walk1[y][26] = 1;
    walk1[y][27] = 10;
    walk1[y][28] = 1;
  }

  // Walk frame 2
  const walk2 = walk1.map(row => [...row]);
  for (let y = 34; y <= 42; y++) {
    walk2[y][14] = 0;
    walk2[y][15] = 0;
    walk2[y][16] = 0;
    walk2[y][26] = 0;
    walk2[y][27] = 0;
    walk2[y][28] = 0;
  }
  for (let y = 34; y <= 42; y++) {
    walk2[y][12] = 1;
    walk2[y][13] = 10;
    walk2[y][14] = 1;
    walk2[y][28] = 1;
    walk2[y][29] = 10;
    walk2[y][30] = 1;
  }

  // Attack 1
  const attack1 = walk1.map(row => [...row]);

  // Attack 2: mouth open wide
  const attack2 = createEmpty(48, 48);
  // Body
  for (let y = 16; y <= 34; y++) {
    for (let x = 8; x <= 38; x++) {
      if (y === 16 || y === 34 || x === 8 || x === 38) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 10;
      }
    }
  }

  // Upper head
  for (let y = 12; y <= 20; y++) {
    for (let x = 28; x <= 44; x++) {
      if (y === 12 || x === 28 || x === 44) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 10;
      }
    }
  }

  // Lower jaw (open)
  for (let y = 24; y <= 32; y++) {
    for (let x = 30; x <= 46; x++) {
      if (y === 32 || x === 30 || x === 46) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 9;
      }
    }
  }

  // Eyes
  addEyes(attack2, 32, 36, 14);

  // Teeth
  for (let x = 32; x <= 42; x += 3) {
    attack2[20][x] = 6;
    attack2[24][x] = 6;
  }

  // Legs
  for (let y = 34; y <= 42; y++) {
    attack2[y][14] = 1;
    attack2[y][15] = 10;
    attack2[y][16] = 1;
    attack2[y][26] = 1;
    attack2[y][27] = 10;
    attack2[y][28] = 1;
  }

  return {
    walk: [walk1, walk2] as const,
    attack: [attack1, attack2] as const,
  };
}

// === ELEPHANT BOSS (96x96) ===
function createElephant(): EnemyPixelArt {
  const walk1 = createEmpty(96, 96);

  // Large body (gray)
  for (let y = 30; y <= 70; y++) {
    for (let x = 20; x <= 70; x++) {
      if (y === 30 || y === 70 || x === 20 || x === 70) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 9; // stone light gray
      }
    }
  }

  // Darker back
  for (let y = 32; y <= 50; y++) {
    for (let x = 22; x <= 40; x++) {
      if (walk1[y][x] === 9) {
        walk1[y][x] = 10; // stone dark
      }
    }
  }

  // Head (larger)
  for (let y = 20; y <= 50; y++) {
    for (let x = 60; x <= 86; x++) {
      if (y === 20 || y === 50 || x === 60 || x === 86) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 9;
      }
    }
  }

  // Trunk (curved down)
  const trunkPoints = [
    { x: 84, y: 50 },
    { x: 86, y: 54 },
    { x: 86, y: 58 },
    { x: 84, y: 62 },
    { x: 80, y: 64 },
    { x: 76, y: 64 },
  ];

  for (let i = 0; i < trunkPoints.length - 1; i++) {
    const p1 = trunkPoints[i];
    const p2 = trunkPoints[i + 1];
    const steps = Math.max(Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y));

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = Math.floor(p1.x + (p2.x - p1.x) * t);
      const y = Math.floor(p1.y + (p2.y - p1.y) * t);

      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (Math.abs(dy) === 2 || Math.abs(dx) === 2) {
            walk1[y + dy][x + dx] = 1;
          } else {
            walk1[y + dy][x + dx] = 9;
          }
        }
      }
    }
  }

  // Large ears
  for (let y = 22; y <= 48; y++) {
    for (let x = 56; x <= 62; x++) {
      if (y === 22 || y === 48 || x === 56) {
        walk1[y][x] = 1;
      } else {
        walk1[y][x] = 28; // warm brown for ears
      }
    }
  }

  // Tusks
  for (let y = 48; y <= 56; y++) {
    walk1[y][82] = 6; // white
    walk1[y][83] = 6;
    walk1[y][80] = 6;
    walk1[y][81] = 6;
  }
  walk1[48][82] = 1;
  walk1[48][83] = 1;
  walk1[48][80] = 1;
  walk1[48][81] = 1;

  // Big eyes
  for (let y = 28; y <= 32; y++) {
    for (let x = 68; x <= 72; x++) {
      walk1[y][x] = 4;
    }
  }
  walk1[29][69] = 5;
  walk1[29][70] = 5;
  walk1[30][69] = 5;
  walk1[30][70] = 5;

  // Legs (frame 1)
  const legPositions = [
    { x: 28, y: 70 },
    { x: 38, y: 70 },
    { x: 48, y: 70 },
    { x: 58, y: 70 },
  ];

  for (const leg of legPositions) {
    for (let y = leg.y; y <= leg.y + 16; y++) {
      for (let x = leg.x; x <= leg.x + 6; x++) {
        if (x === leg.x || x === leg.x + 6 || y === leg.y + 16) {
          walk1[y][x] = 1;
        } else {
          walk1[y][x] = 9;
        }
      }
    }
  }

  // Walk frame 2: legs shifted
  const walk2 = walk1.map(row => [...row]);
  for (const leg of legPositions) {
    for (let y = leg.y; y <= leg.y + 16; y++) {
      for (let x = leg.x; x <= leg.x + 6; x++) {
        walk2[y][x] = 0;
      }
    }
  }

  const legPositions2 = [
    { x: 26, y: 70 },
    { x: 40, y: 70 },
    { x: 46, y: 70 },
    { x: 60, y: 70 },
  ];

  for (const leg of legPositions2) {
    for (let y = leg.y; y <= leg.y + 16; y++) {
      for (let x = leg.x; x <= leg.x + 6; x++) {
        if (x === leg.x || x === leg.x + 6 || y === leg.y + 16) {
          walk2[y][x] = 1;
        } else {
          walk2[y][x] = 9;
        }
      }
    }
  }

  // Attack 1
  const attack1 = walk1.map(row => [...row]);

  // Attack 2: stomp pose (raised trunk, one leg up)
  const attack2 = createEmpty(96, 96);

  // Body
  for (let y = 30; y <= 70; y++) {
    for (let x = 20; x <= 70; x++) {
      if (y === 30 || y === 70 || x === 20 || x === 70) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 9;
      }
    }
  }

  for (let y = 32; y <= 50; y++) {
    for (let x = 22; x <= 40; x++) {
      if (attack2[y][x] === 9) {
        attack2[y][x] = 10;
      }
    }
  }

  // Head
  for (let y = 20; y <= 50; y++) {
    for (let x = 60; x <= 86; x++) {
      if (y === 20 || y === 50 || x === 60 || x === 86) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 9;
      }
    }
  }

  // Trunk raised up
  const trunkUp = [
    { x: 84, y: 50 },
    { x: 86, y: 46 },
    { x: 86, y: 42 },
    { x: 84, y: 38 },
    { x: 82, y: 34 },
    { x: 80, y: 30 },
  ];

  for (let i = 0; i < trunkUp.length - 1; i++) {
    const p1 = trunkUp[i];
    const p2 = trunkUp[i + 1];
    const steps = Math.max(Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y));

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = Math.floor(p1.x + (p2.x - p1.x) * t);
      const y = Math.floor(p1.y + (p2.y - p1.y) * t);

      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (Math.abs(dy) === 2 || Math.abs(dx) === 2) {
            attack2[y + dy][x + dx] = 1;
          } else {
            attack2[y + dy][x + dx] = 9;
          }
        }
      }
    }
  }

  // Ears
  for (let y = 22; y <= 48; y++) {
    for (let x = 56; x <= 62; x++) {
      if (y === 22 || y === 48 || x === 56) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 28; // warm brown for ears
      }
    }
  }

  // Tusks
  for (let y = 48; y <= 56; y++) {
    attack2[y][82] = 6;
    attack2[y][83] = 6;
    attack2[y][80] = 6;
    attack2[y][81] = 6;
  }
  attack2[48][82] = 1;
  attack2[48][83] = 1;
  attack2[48][80] = 1;
  attack2[48][81] = 1;

  // Eyes
  for (let y = 28; y <= 32; y++) {
    for (let x = 68; x <= 72; x++) {
      attack2[y][x] = 4;
    }
  }
  attack2[29][69] = 5;
  attack2[29][70] = 5;
  attack2[30][69] = 5;
  attack2[30][70] = 5;

  // Three legs on ground, one raised
  const legsAttack = [
    { x: 28, y: 70 },
    { x: 48, y: 70 },
    { x: 58, y: 70 },
  ];

  for (const leg of legsAttack) {
    for (let y = leg.y; y <= leg.y + 16; y++) {
      for (let x = leg.x; x <= leg.x + 6; x++) {
        if (x === leg.x || x === leg.x + 6 || y === leg.y + 16) {
          attack2[y][x] = 1;
        } else {
          attack2[y][x] = 9;
        }
      }
    }
  }

  // One leg raised (front left)
  for (let y = 60; y <= 70; y++) {
    for (let x = 36; x <= 42; x++) {
      if (x === 36 || x === 42 || y === 60) {
        attack2[y][x] = 1;
      } else {
        attack2[y][x] = 9;
      }
    }
  }

  return {
    walk: [walk1, walk2] as const,
    attack: [attack1, attack2] as const,
  };
}

// === EXPORTS ===
export const piranhaEnemy: EnemyPixelArt = createPiranha();
export const catfishEnemy: EnemyPixelArt = createCatfish();
export const iguanaEnemy: EnemyPixelArt = createIguana();
export const waterSnakeEnemy: EnemyPixelArt = createWaterSnake();
export const turtleEnemy: EnemyPixelArt = createTurtle();
export const anacondaEnemy: EnemyPixelArt = createAnaconda();
export const crocodileEnemy: EnemyPixelArt = createCrocodile();
export const hippoEnemy: EnemyPixelArt = createHippo();
export const elephantEnemy: EnemyPixelArt = createElephant();

export const enemyPixelArt: Record<string, EnemyPixelArt> = {
  piranha: piranhaEnemy,
  catfish: catfishEnemy,
  iguana: iguanaEnemy,
  waterSnake: waterSnakeEnemy,
  turtle: turtleEnemy,
  anaconda: anacondaEnemy,
  crocodile: crocodileEnemy,
  hippo: hippoEnemy,
  elephant: elephantEnemy,
};
