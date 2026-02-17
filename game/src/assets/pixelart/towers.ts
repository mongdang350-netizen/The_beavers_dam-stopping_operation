import type { PixelData } from '@/assets/PixelArtEngine';
import { createEmpty, composeLayer } from '@/assets/PixelArtHelpers';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TowerPixelArt {
  idle: PixelData[];    // 2 frames (subtle animation like blinking/swaying)
  action: PixelData[];  // 3 frames (attack/action animation)
}

// ─── Palette index constants ─────────────────────────────────────────────────
// 0  = transparent
// 1  = outline (dark brown)
// 2  = beaver brown
// 3  = beaver cream (belly)
// 4  = eye white
// 5  = eye black
// 6  = teeth white
// 7  = wood light
// 8  = wood dark
// 9  = stone light
// 10 = stone dark
// 11 = grass light
// 12 = grass dark
// 13 = river light (water/blue)
// 14 = river dark (water/blue dark)
// 15 = beaver dark brown
// 16 = fire red
// 17 = fire orange
// 18 = gold yellow
// 19 = light yellow
// 20 = magic purple
// 21 = dark purple
// 22 = teal
// 23 = dark teal
// 24 = ice blue
// 25 = salmon
// 26 = dark red
// 27 = rust
// 28 = warm brown
// 29 = olive
// 30 = pink
// 31 = dark olive

// ─── Internal helpers ────────────────────────────────────────────────────────

/** Deep-clone a mutable grid */
function cloneGrid(g: number[][]): number[][] {
  return g.map(row => [...row]);
}

/** Draw a filled rectangle on a grid */
function fillRect(
  grid: number[][],
  x: number, y: number,
  w: number, h: number,
  fill: number, outline: number
): void {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      if (row < 0 || row >= 48 || col < 0 || col >= 48) continue;
      const isEdge = row === y || row === y + h - 1 || col === x || col === x + w - 1;
      grid[row][col] = isEdge ? outline : fill;
    }
  }
}

/** Draw a single pixel safely */
function setPixel(grid: number[][], x: number, y: number, color: number): void {
  if (y >= 0 && y < 48 && x >= 0 && x < 48) {
    grid[y][x] = color;
  }
}

/** Create a small beaver operator (16x16) positioned at top of tower */
function createSmallBeaver(): number[][] {
  const b = createEmpty(16, 16);
  // Head (rows 0-8)
  for (let y = 1; y <= 8; y++) {
    const startX = y <= 2 ? 4 : 3;
    const endX = y <= 2 ? 11 : 12;
    for (let x = startX; x <= endX; x++) {
      b[y][x] = (x === startX || x === endX || y === 1 || y === 8) ? 1 : 2;
    }
  }
  // Ears
  b[0][3] = 1; b[0][4] = 2; b[0][5] = 1;
  b[0][10] = 1; b[0][11] = 2; b[0][12] = 1;
  // Eyes
  b[4][5] = 4; b[4][6] = 5;
  b[4][9] = 4; b[4][10] = 5;
  // Nose
  b[6][7] = 1; b[6][8] = 1;
  // Teeth
  b[7][7] = 6; b[7][8] = 6;
  // Body (rows 9-14)
  for (let y = 9; y <= 14; y++) {
    const startX = 4;
    const endX = 11;
    for (let x = startX; x <= endX; x++) {
      if (x === startX || x === endX || y === 14) {
        b[y][x] = 1;
      } else if (x >= 6 && x <= 9 && y >= 10 && y <= 13) {
        b[y][x] = 3; // cream belly
      } else {
        b[y][x] = 2;
      }
    }
  }
  // Tail
  b[12][12] = 1; b[12][13] = 15; b[12][14] = 1;
  b[13][12] = 1; b[13][13] = 15; b[13][14] = 1;
  b[14][13] = 1;
  return b;
}

/** Create a blinking version of the small beaver (eyes closed) */
function createSmallBeaverBlink(): number[][] {
  const b = createSmallBeaver();
  // Close eyes: replace eye pixels with a line
  b[4][5] = 1; b[4][6] = 1;
  b[4][9] = 1; b[4][10] = 1;
  return b;
}

/** Build a wooden tower base (bottom 2/3 of 48x48) */
function createWoodTowerBase(): number[][] {
  const g = createEmpty(48, 48);
  // Platform / ground
  fillRect(g, 4, 44, 40, 4, 12, 1);
  // Main tower body
  fillRect(g, 10, 20, 28, 24, 7, 1);
  // Dark wood cross beams
  for (let x = 11; x <= 36; x++) {
    g[26][x] = 8;
    g[32][x] = 8;
    g[38][x] = 8;
  }
  // Vertical planks
  for (let y = 21; y <= 42; y++) {
    g[y][18] = 8;
    g[y][24] = 8;
    g[y][30] = 8;
  }
  // Door
  fillRect(g, 20, 36, 8, 8, 8, 1);
  g[40][23] = 7; g[40][24] = 7; // door handle
  return g;
}

/** Build a stone tower base */
function createStoneTowerBase(): number[][] {
  const g = createEmpty(48, 48);
  // Platform
  fillRect(g, 4, 44, 40, 4, 12, 1);
  // Main tower body
  fillRect(g, 10, 18, 28, 26, 9, 1);
  // Stone brick pattern
  for (let row = 19; row <= 42; row += 4) {
    for (let col = 11; col <= 36; col++) {
      g[row][col] = 10; // mortar line
    }
  }
  for (let row = 21; row <= 42; row += 4) {
    for (let x = 17; x <= 36; x += 8) {
      if (x < 37) g[row][x] = 10;
      if (x < 37 && row + 1 < 44) g[row + 1][x] = 10;
    }
  }
  // Arrow slit
  fillRect(g, 22, 24, 4, 8, 5, 1);
  return g;
}

/** Build a brick fort base */
function createBrickFortBase(): number[][] {
  const g = createEmpty(48, 48);
  // Platform
  fillRect(g, 2, 44, 44, 4, 12, 1);
  // Wide fort body
  fillRect(g, 6, 20, 36, 24, 10, 1);
  // Brick pattern (lighter bricks)
  for (let row = 21; row <= 42; row += 3) {
    for (let col = 7; col <= 40; col++) {
      g[row][col] = 9;
    }
  }
  // Crenellations on top
  for (let x = 6; x <= 40; x += 5) {
    fillRect(g, x, 16, 3, 4, 10, 1);
  }
  // Gate
  fillRect(g, 18, 34, 12, 10, 8, 1);
  // Shields on walls
  fillRect(g, 10, 26, 4, 4, 9, 1);
  setPixel(g, 11, 27, 7); setPixel(g, 12, 27, 7);
  setPixel(g, 11, 28, 7); setPixel(g, 12, 28, 7);
  fillRect(g, 34, 26, 4, 4, 9, 1);
  setPixel(g, 35, 27, 7); setPixel(g, 36, 27, 7);
  setPixel(g, 35, 28, 7); setPixel(g, 36, 28, 7);
  return g;
}

/** Build a farm plot base */
function createFarmPlotBase(): number[][] {
  const g = createEmpty(48, 48);
  // Ground / dirt
  fillRect(g, 2, 36, 44, 12, 8, 1);
  // Fence posts
  fillRect(g, 4, 28, 3, 8, 7, 1);
  fillRect(g, 41, 28, 3, 8, 7, 1);
  // Fence rails
  for (let x = 7; x <= 40; x++) {
    g[30][x] = 7;
    g[34][x] = 7;
    g[29][x] = 1;
    g[31][x] = 1;
    g[33][x] = 1;
    g[35][x] = 1;
  }
  // Soil rows
  for (let row = 38; row <= 44; row += 3) {
    for (let x = 4; x <= 43; x++) {
      g[row][x] = 15; // dark brown furrows
    }
  }
  // Small green sprouts
  for (let x = 8; x <= 40; x += 5) {
    g[37][x] = 11; g[36][x] = 12; g[35][x + 1] = 0;
    g[40][x + 2] = 11; g[39][x + 2] = 12;
  }
  return g;
}

/** Build a lab/workshop base (gray brick) */
function createLabBase(): number[][] {
  const g = createEmpty(48, 48);
  // Platform
  fillRect(g, 4, 44, 40, 4, 12, 1);
  // Main body (gray bricks)
  fillRect(g, 8, 18, 32, 26, 9, 1);
  // Brick pattern
  for (let row = 19; row <= 42; row += 3) {
    for (let col = 9; col <= 38; col++) {
      g[row][col] = 10;
    }
  }
  // Chimney
  fillRect(g, 32, 10, 6, 8, 10, 1);
  // Smoke puffs
  setPixel(g, 34, 8, 9); setPixel(g, 35, 7, 9); setPixel(g, 36, 9, 9);
  // Window
  fillRect(g, 14, 24, 6, 6, 13, 1);
  // Cross in window
  for (let y = 25; y <= 28; y++) g[y][17] = 1;
  for (let x = 15; x <= 18; x++) g[27][x] = 1;
  // Door
  fillRect(g, 28, 34, 8, 10, 8, 1);
  return g;
}

/** Wooden tower with peaked roof (for archer) */
function createArcherTowerBase(): number[][] {
  const g = createWoodTowerBase();
  // Peaked roof
  for (let i = 0; i <= 10; i++) {
    const y = 19 - i;
    const startX = 24 - i - 4;
    const endX = 24 + i + 4;
    for (let x = startX; x <= endX; x++) {
      if (y >= 0 && x >= 0 && x < 48) {
        g[y][x] = (x === startX || x === endX || i === 10) ? 1 : 8;
      }
    }
  }
  // Roof ridge detail
  for (let y = 9; y <= 19; y++) {
    setPixel(g, 24, y, 1);
  }
  return g;
}

/** Moss-covered tower (for blowgunner) */
function createMossTowerBase(): number[][] {
  const g = createWoodTowerBase();
  // Add moss patches (grass colors over wood)
  for (let y = 20; y <= 43; y += 3) {
    for (let x = 10; x <= 37; x += 4) {
      if (g[y][x] === 7) {
        setPixel(g, x, y, 11);
        if (x + 1 < 48 && g[y][x + 1] === 7) setPixel(g, x + 1, y, 12);
      }
    }
  }
  // Vines hanging from top
  for (let x = 12; x <= 36; x += 6) {
    for (let y = 20; y <= 26; y++) {
      if (g[y][x] === 7 || g[y][x] === 0) setPixel(g, x, y, 11);
    }
  }
  return g;
}

/** Stone tower with banner (for knight) */
function createKnightTowerBase(): number[][] {
  const g = createStoneTowerBase();
  // Banner pole
  for (let y = 6; y <= 18; y++) {
    setPixel(g, 24, y, 1);
  }
  // Banner flag (fire red)
  fillRect(g, 25, 7, 8, 6, 16, 1);
  // Banner emblem (star shape simplified)
  setPixel(g, 28, 9, 18); // gold yellow
  setPixel(g, 29, 9, 18);
  setPixel(g, 27, 10, 18);
  setPixel(g, 28, 10, 19); // light yellow
  setPixel(g, 29, 10, 19);
  setPixel(g, 30, 10, 18);
  setPixel(g, 28, 11, 18);
  setPixel(g, 29, 11, 18);
  return g;
}

/** Iron low tower (for dragon tamer) */
function createIronLowTowerBase(): number[][] {
  const g = createEmpty(48, 48);
  // Platform
  fillRect(g, 4, 44, 40, 4, 12, 1);
  // Low wide iron tower
  fillRect(g, 8, 26, 32, 18, 10, 1);
  // Iron plate rivets
  for (let y = 28; y <= 42; y += 4) {
    for (let x = 12; x <= 36; x += 4) {
      setPixel(g, x, y, 9);
    }
  }
  // Reinforced top edge
  for (let x = 8; x <= 39; x++) {
    g[26][x] = 1;
    g[27][x] = 10;
  }
  // Fire pit / nest area on top
  fillRect(g, 14, 22, 20, 4, 8, 1);
  // Embers
  setPixel(g, 18, 23, 15); setPixel(g, 22, 23, 15);
  setPixel(g, 26, 23, 15); setPixel(g, 30, 23, 15);
  return g;
}

/** Iron tall tower (for wizard) */
function createIronTallTowerBase(): number[][] {
  const g = createEmpty(48, 48);
  // Platform
  fillRect(g, 4, 44, 40, 4, 12, 1);
  // Tall narrow iron tower
  fillRect(g, 14, 12, 20, 32, 10, 1);
  // Iron rivets
  for (let y = 14; y <= 42; y += 4) {
    for (let x = 18; x <= 30; x += 4) {
      setPixel(g, x, y, 9);
    }
  }
  // Pointed top
  for (let i = 0; i <= 6; i++) {
    const y = 11 - i;
    const startX = 24 - 3 + Math.floor(i / 2);
    const endX = 24 + 3 - Math.floor(i / 2);
    for (let x = startX; x <= endX; x++) {
      if (y >= 0) {
        g[y][x] = (x === startX || x === endX) ? 1 : 10;
      }
    }
  }
  // Glowing window
  fillRect(g, 20, 20, 8, 6, 13, 1);
  // Star in window
  setPixel(g, 23, 22, 6); setPixel(g, 24, 22, 6);
  setPixel(g, 23, 23, 6); setPixel(g, 24, 23, 6);
  return g;
}

/** Brick tower with hole (for log roller) */
function createLogRollerBase(): number[][] {
  const g = createEmpty(48, 48);
  // Platform
  fillRect(g, 4, 44, 40, 4, 12, 1);
  // Brick body
  fillRect(g, 8, 18, 32, 26, 10, 1);
  // Brick pattern
  for (let row = 19; row <= 42; row += 3) {
    for (let col = 9; col <= 38; col++) {
      g[row][col] = 9;
    }
  }
  // Large hole for rolling logs
  for (let y = 30; y <= 38; y++) {
    for (let x = 16; x <= 31; x++) {
      const dx = x - 23.5;
      const dy = y - 34;
      if (dx * dx / 64 + dy * dy / 16 <= 1) {
        g[y][x] = (Math.abs(dx * dx / 64 + dy * dy / 16 - 1) < 0.2) ? 1 : 5;
      }
    }
  }
  // Log visible in hole
  setPixel(g, 22, 34, 7); setPixel(g, 23, 34, 7);
  setPixel(g, 24, 34, 7); setPixel(g, 25, 34, 7);
  setPixel(g, 22, 35, 8); setPixel(g, 23, 35, 8);
  setPixel(g, 24, 35, 8); setPixel(g, 25, 35, 8);
  return g;
}

/** Brick tower with mortar tube (for water bomber) */
function createMortarTowerBase(): number[][] {
  const g = createEmpty(48, 48);
  // Platform
  fillRect(g, 4, 44, 40, 4, 12, 1);
  // Brick body
  fillRect(g, 8, 22, 32, 22, 10, 1);
  // Brick pattern
  for (let row = 23; row <= 42; row += 3) {
    for (let col = 9; col <= 38; col++) {
      g[row][col] = 9;
    }
  }
  // Mortar tube (angled)
  fillRect(g, 18, 10, 6, 12, 10, 1);
  // Tube opening
  fillRect(g, 19, 8, 4, 3, 5, 1);
  // Tube reinforcement rings
  for (let x = 18; x <= 23; x++) {
    g[14][x] = 1;
    g[18][x] = 1;
  }
  // Water bucket nearby
  fillRect(g, 34, 30, 6, 6, 14, 1);
  setPixel(g, 36, 29, 1); setPixel(g, 37, 29, 1); // handle
  setPixel(g, 36, 31, 13); setPixel(g, 37, 31, 13);
  setPixel(g, 38, 31, 13);
  return g;
}

/** Freeze a mutable grid into readonly PixelData */
function freeze(grid: number[][]): PixelData {
  return grid.map(row => Object.freeze([...row])) as PixelData;
}

// ─── Tower composition helpers ───────────────────────────────────────────────

/** Place the small beaver on top of a tower scene */
function placeBeaverOnTower(tower: number[][], beaverOffsetX: number, beaverOffsetY: number, blink: boolean): number[][] {
  const beaver = blink ? createSmallBeaverBlink() : createSmallBeaver();
  return composeLayer(tower, beaver, beaverOffsetX, beaverOffsetY);
}

// ─── Accessory overlays ──────────────────────────────────────────────────────

/** Draw a slingshot in beaver's hand area */
function addSlingshot(grid: number[][], bx: number, by: number): void {
  // Y-shaped slingshot next to beaver
  const sx = bx + 14;
  const sy = by + 6;
  setPixel(grid, sx, sy, 8);
  setPixel(grid, sx + 1, sy - 1, 8);
  setPixel(grid, sx - 1, sy - 1, 8);
  setPixel(grid, sx, sy + 1, 8);
  setPixel(grid, sx, sy + 2, 8);
  setPixel(grid, sx, sy + 3, 8);
  // Elastic band
  setPixel(grid, sx + 1, sy, 1);
  setPixel(grid, sx - 1, sy, 1);
}

/** Draw a bow in beaver's hand area */
function addBow(grid: number[][], bx: number, by: number): void {
  const sx = bx + 15;
  const sy = by + 4;
  for (let i = 0; i < 8; i++) {
    setPixel(grid, sx, sy + i, 8);
  }
  // Bowstring
  setPixel(grid, sx - 1, sy, 1);
  setPixel(grid, sx - 1, sy + 7, 1);
  for (let i = 1; i < 7; i++) {
    setPixel(grid, sx - 1, sy + i, 9);
  }
}

/** Draw a staff in beaver's hand */
function addStaff(grid: number[][], bx: number, by: number): void {
  const sx = bx + 14;
  for (let y = by; y <= by + 14; y++) {
    setPixel(grid, sx, y, 8);
  }
  // Orb on top
  setPixel(grid, sx - 1, by - 1, 20); // magic purple
  setPixel(grid, sx, by - 1, 20);
  setPixel(grid, sx + 1, by - 1, 20);
  setPixel(grid, sx, by - 2, 21); // dark purple
}

/** Draw a hoe in beaver's hand */
function addHoe(grid: number[][], bx: number, by: number): void {
  const sx = bx + 14;
  for (let y = by + 2; y <= by + 14; y++) {
    setPixel(grid, sx, y, 8);
  }
  // Hoe head
  setPixel(grid, sx - 1, by + 14, 10);
  setPixel(grid, sx + 1, by + 14, 10);
  setPixel(grid, sx - 2, by + 14, 10);
  setPixel(grid, sx + 2, by + 14, 10);
}

/** Draw glasses on beaver */
function addGlasses(grid: number[][], bx: number, by: number): void {
  // Left lens frame
  setPixel(grid, bx + 4, by + 3, 1);
  setPixel(grid, bx + 5, by + 3, 1);
  setPixel(grid, bx + 6, by + 3, 1);
  setPixel(grid, bx + 7, by + 3, 1);
  setPixel(grid, bx + 4, by + 5, 1);
  setPixel(grid, bx + 5, by + 5, 1);
  setPixel(grid, bx + 6, by + 5, 1);
  setPixel(grid, bx + 7, by + 5, 1);
  // Bridge
  setPixel(grid, bx + 7, by + 4, 1);
  setPixel(grid, bx + 8, by + 4, 1);
  // Right lens frame
  setPixel(grid, bx + 8, by + 3, 1);
  setPixel(grid, bx + 9, by + 3, 1);
  setPixel(grid, bx + 10, by + 3, 1);
  setPixel(grid, bx + 11, by + 3, 1);
  setPixel(grid, bx + 8, by + 5, 1);
  setPixel(grid, bx + 9, by + 5, 1);
  setPixel(grid, bx + 10, by + 5, 1);
  setPixel(grid, bx + 11, by + 5, 1);
}

/** Draw helmet on beaver */
function addHelmet(grid: number[][], bx: number, by: number): void {
  for (let x = bx + 3; x <= bx + 12; x++) {
    setPixel(grid, x, by, 10);
    setPixel(grid, x, by - 1, 10);
  }
  for (let x = bx + 4; x <= bx + 11; x++) {
    setPixel(grid, x, by - 2, 9);
  }
  // Outline top
  for (let x = bx + 4; x <= bx + 11; x++) {
    setPixel(grid, x, by - 3, 1);
  }
  setPixel(grid, bx + 3, by - 2, 1);
  setPixel(grid, bx + 12, by - 2, 1);
}

/** Draw miner hat on beaver */
function addMinerHat(grid: number[][], bx: number, by: number): void {
  for (let x = bx + 3; x <= bx + 12; x++) {
    setPixel(grid, x, by - 1, 8);
  }
  for (let x = bx + 5; x <= bx + 10; x++) {
    setPixel(grid, x, by - 2, 8);
  }
  // Lamp
  setPixel(grid, bx + 7, by - 3, 3);
  setPixel(grid, bx + 8, by - 3, 3);
  setPixel(grid, bx + 7, by - 2, 1);
  setPixel(grid, bx + 8, by - 2, 1);
}

/** Draw a small dragon companion */
function addSmallDragon(grid: number[][], dx: number, dy: number): void {
  // Body
  fillRect(grid, dx, dy, 6, 4, 16, 1); // fire red
  // Head
  fillRect(grid, dx + 5, dy - 1, 4, 3, 17, 1); // fire orange
  // Eye
  setPixel(grid, dx + 7, dy - 1, 5);
  // Wings
  setPixel(grid, dx + 1, dy - 1, 16);
  setPixel(grid, dx + 2, dy - 2, 16);
  setPixel(grid, dx + 3, dy - 2, 17);
  setPixel(grid, dx + 2, dy - 1, 17);
  // Tail
  setPixel(grid, dx - 1, dy + 1, 16);
  setPixel(grid, dx - 2, dy + 2, 25); // salmon
}

/** Draw a speech bubble */
function addSpeechBubble(grid: number[][], bx: number, by: number): void {
  fillRect(grid, bx, by, 10, 6, 4, 1);
  // Tail of bubble
  setPixel(grid, bx + 2, by + 6, 1);
  setPixel(grid, bx + 1, by + 7, 1);
  // Exclamation mark inside
  setPixel(grid, bx + 4, by + 1, 5);
  setPixel(grid, bx + 4, by + 2, 5);
  setPixel(grid, bx + 4, by + 3, 5);
  setPixel(grid, bx + 4, by + 4, 0);
  setPixel(grid, bx + 5, by + 1, 5);
  setPixel(grid, bx + 5, by + 2, 5);
  setPixel(grid, bx + 5, by + 3, 5);
}

/** Draw a flying stone projectile */
function addStoneProjectile(grid: number[][], px: number, py: number): void {
  setPixel(grid, px, py, 10);
  setPixel(grid, px + 1, py, 9);
  setPixel(grid, px, py + 1, 9);
  setPixel(grid, px + 1, py + 1, 10);
}

/** Draw a flying arrow */
function addArrow(grid: number[][], px: number, py: number, len: number): void {
  for (let i = 0; i < len; i++) {
    setPixel(grid, px + i, py, 8);
  }
  // Arrowhead
  setPixel(grid, px + len, py, 1);
  setPixel(grid, px + len, py - 1, 1);
  setPixel(grid, px + len, py + 1, 1);
  // Fletching
  setPixel(grid, px, py - 1, 7);
  setPixel(grid, px, py + 1, 7);
}

/** Draw a dart projectile */
function addDart(grid: number[][], px: number, py: number): void {
  setPixel(grid, px, py, 1);
  setPixel(grid, px + 1, py, 8);
  setPixel(grid, px + 2, py, 8);
  setPixel(grid, px + 3, py, 1);
  // Feather
  setPixel(grid, px, py - 1, 11);
  setPixel(grid, px, py + 1, 11);
}

/** Draw sparkle/magic effect */
function addSparkles(grid: number[][], cx: number, cy: number, spread: number): void {
  const offsets = [
    [0, -spread], [spread, 0], [0, spread], [-spread, 0],
    [spread - 1, -spread + 1], [spread - 1, spread - 1],
    [-spread + 1, -spread + 1], [-spread + 1, spread - 1],
  ];
  for (const [dx, dy] of offsets) {
    setPixel(grid, cx + dx, cy + dy, 19); // light yellow
  }
  // Center glow
  setPixel(grid, cx, cy, 20); // magic purple
  setPixel(grid, cx + 1, cy, 4);
  setPixel(grid, cx - 1, cy, 4);
  setPixel(grid, cx, cy + 1, 4);
  setPixel(grid, cx, cy - 1, 4);
}

/** Draw fire breath effect */
function addFireBreath(grid: number[][], fx: number, fy: number, size: number): void {
  for (let i = 0; i < size; i++) {
    for (let j = -i; j <= i; j++) {
      const px = fx + i;
      const py = fy + j;
      if (px >= 0 && px < 48 && py >= 0 && py < 48) {
        const color = Math.abs(j) <= Math.floor(i / 2) ? 18 : 16; // gold yellow core, fire red outer
        setPixel(grid, px, py, color);
      }
    }
  }
  // Orange tips
  setPixel(grid, fx + size, fy, 17);
  setPixel(grid, fx + size - 1, fy - 1, 17);
  setPixel(grid, fx + size - 1, fy + 1, 17);
}

/** Draw a mug in beaver's hand */
function addMug(grid: number[][], mx: number, my: number): void {
  fillRect(grid, mx, my, 4, 5, 7, 1);
  // Handle
  setPixel(grid, mx + 4, my + 1, 1);
  setPixel(grid, mx + 5, my + 1, 1);
  setPixel(grid, mx + 5, my + 2, 1);
  setPixel(grid, mx + 5, my + 3, 1);
  setPixel(grid, mx + 4, my + 3, 1);
  // Foam
  setPixel(grid, mx + 1, my, 19); // light yellow
  setPixel(grid, mx + 2, my, 19);
}

/** Draw a flag in beaver's hand */
function addFlag(grid: number[][], fx: number, fy: number, waveOffset: number): void {
  // Pole
  for (let y = fy; y <= fy + 14; y++) {
    setPixel(grid, fx, y, 8);
  }
  // Flag banner (wavy depending on offset)
  for (let y = 0; y < 5; y++) {
    for (let x = 1; x <= 7; x++) {
      const waveY = fy + y + (x > 4 ? waveOffset : 0);
      if (waveY >= 0 && waveY < 48) {
        setPixel(grid, fx + x, waveY, 16); // fire red
        if (y === 0 || y === 4 || x === 7) {
          setPixel(grid, fx + x, waveY, 1);
        }
      }
    }
  }
  // Emblem on flag
  setPixel(grid, fx + 3, fy + 2, 18); // gold yellow
  setPixel(grid, fx + 4, fy + 2, 18);
}

/** Draw a lever mechanism */
function addLever(grid: number[][], lx: number, ly: number, pulled: boolean): void {
  // Base
  fillRect(grid, lx, ly + 3, 4, 3, 10, 1);
  // Lever arm
  if (pulled) {
    setPixel(grid, lx + 1, ly, 8);
    setPixel(grid, lx + 1, ly + 1, 8);
    setPixel(grid, lx + 1, ly + 2, 8);
    setPixel(grid, lx + 1, ly + 3, 8);
    // Handle
    setPixel(grid, lx, ly, 9);
    setPixel(grid, lx + 2, ly, 9);
  } else {
    setPixel(grid, lx + 2, ly + 1, 8);
    setPixel(grid, lx + 3, ly, 8);
    setPixel(grid, lx + 4, ly - 1, 8);
    // Handle
    setPixel(grid, lx + 4, ly - 2, 9);
    setPixel(grid, lx + 5, ly - 1, 9);
  }
}

/** Draw water bomb projectile */
function addWaterBomb(grid: number[][], px: number, py: number): void {
  // Round water balloon
  setPixel(grid, px, py - 1, 23); // dark teal
  setPixel(grid, px - 1, py, 23);
  setPixel(grid, px, py, 13);
  setPixel(grid, px + 1, py, 23);
  setPixel(grid, px, py + 1, 23);
  // Highlight
  setPixel(grid, px - 1, py - 1, 22); // teal
}

/** Draw water splash effect */
function addWaterSplash(grid: number[][], cx: number, cy: number, size: number): void {
  for (let i = -size; i <= size; i++) {
    setPixel(grid, cx + i, cy, 13);
    setPixel(grid, cx + i, cy - 1, 14);
  }
  // Droplets above (add teal variety)
  setPixel(grid, cx - size + 1, cy - 3, 22); // teal
  setPixel(grid, cx, cy - 4, 14);
  setPixel(grid, cx + size - 1, cy - 3, 13);
  setPixel(grid, cx - 1, cy - 2, 13);
  setPixel(grid, cx + 1, cy - 2, 22); // teal
}

/** Draw a camo pattern on beaver */
function addCamo(grid: number[][], bx: number, by: number): void {
  // Replace some beaver brown with olive patches
  const patches = [
    [3, 2], [5, 1], [8, 3], [10, 2],
    [4, 9], [6, 10], [8, 11], [10, 9],
  ];
  for (const [px, py] of patches) {
    const gx = bx + px;
    const gy = by + py;
    if (gy >= 0 && gy < 48 && gx >= 0 && gx < 48) {
      if (grid[gy][gx] === 2) {
        grid[gy][gx] = (px + py) % 2 === 0 ? 29 : 31; // olive and dark olive
      }
    }
  }
}

/** Draw a bomb projectile */
function addBomb(grid: number[][], px: number, py: number): void {
  // Round bomb
  fillRect(grid, px - 1, py - 1, 3, 3, 5, 1);
  // Fuse
  setPixel(grid, px, py - 2, 8);
  setPixel(grid, px + 1, py - 3, 18); // spark (gold yellow)
  setPixel(grid, px + 2, py - 3, 18);
}

/** Draw bomb explosion effect */
function addExplosion(grid: number[][], cx: number, cy: number, size: number): void {
  for (let dy = -size; dy <= size; dy++) {
    for (let dx = -size; dx <= size; dx++) {
      if (dx * dx + dy * dy <= size * size) {
        const px = cx + dx;
        const py = cy + dy;
        if (px >= 0 && px < 48 && py >= 0 && py < 48) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < size / 3) {
            setPixel(grid, px, py, 18); // bright center (gold yellow)
          } else if (dist < size * 2 / 3) {
            setPixel(grid, px, py, 17); // mid ring (fire orange)
          } else {
            setPixel(grid, px, py, 16); // outer ring (fire red)
          }
        }
      }
    }
  }
}

/** Draw log rolling out of hole */
function addRollingLog(grid: number[][], lx: number, ly: number, phase: number): void {
  const offset = phase * 4;
  fillRect(grid, lx + offset, ly, 8, 4, 7, 1);
  // Grain lines
  setPixel(grid, lx + offset + 2, ly + 1, 8);
  setPixel(grid, lx + offset + 4, ly + 2, 8);
  setPixel(grid, lx + offset + 6, ly + 1, 8);
  // End circle
  setPixel(grid, lx + offset, ly + 1, 8);
  setPixel(grid, lx + offset, ly + 2, 8);
}

/** Draw mortar launch smoke */
function addMortarSmoke(grid: number[][], mx: number, my: number, phase: number): void {
  const spread = phase * 2 + 1;
  for (let i = -spread; i <= spread; i++) {
    setPixel(grid, mx + i, my - phase, 9);
    if (Math.abs(i) < spread) {
      setPixel(grid, mx + i, my - phase - 1, 9);
    }
  }
}

// ─── Tower Builders ──────────────────────────────────────────────────────────
// Each builds idle[2] + action[3] frames.
// Beaver is placed at (bx, by) on the tower scene.

const BX = 16; // default beaver X offset on tower
const BY = 4;  // default beaver Y offset on tower

// 1. AGILE — Wooden watchtower + beaver with slingshot
function buildAgileTower(): TowerPixelArt {
  const base = createWoodTowerBase();

  // Idle frame 1: beaver with slingshot
  const idle1 = placeBeaverOnTower(cloneGrid(base), BX, BY, false);
  addSlingshot(idle1, BX, BY);

  // Idle frame 2: beaver blinking
  const idle2 = placeBeaverOnTower(cloneGrid(base), BX, BY, true);
  addSlingshot(idle2, BX, BY);

  // Action 1: wind up (pull slingshot back)
  const act1 = placeBeaverOnTower(cloneGrid(base), BX, BY, false);
  addSlingshot(act1, BX, BY);
  setPixel(act1, BX + 12, BY + 6, 10); // stone loaded

  // Action 2: release
  const act2 = placeBeaverOnTower(cloneGrid(base), BX, BY, false);
  addSlingshot(act2, BX, BY);
  addStoneProjectile(act2, BX + 18, BY + 2);

  // Action 3: follow through, stone flying
  const act3 = placeBeaverOnTower(cloneGrid(base), BX, BY, false);
  addSlingshot(act3, BX, BY);
  addStoneProjectile(act3, 38, 2);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 2. BRAVE — Stone barracks + beaver with rally shout
function buildBraveTower(): TowerPixelArt {
  const base = createStoneTowerBase();

  const idle1 = placeBeaverOnTower(cloneGrid(base), BX, BY + 2, false);
  const idle2 = placeBeaverOnTower(cloneGrid(base), BX, BY + 2, true);

  // Action 1: beaver opens mouth wide
  const act1 = placeBeaverOnTower(cloneGrid(base), BX, BY + 2, false);

  // Action 2: speech bubble appears
  const act2 = placeBeaverOnTower(cloneGrid(base), BX, BY + 2, false);
  addSpeechBubble(act2, BX + 12, BY - 4);

  // Action 3: bigger speech bubble
  const act3 = placeBeaverOnTower(cloneGrid(base), BX, BY + 2, false);
  addSpeechBubble(act3, BX + 10, BY - 6);
  // Extra emphasis marks
  setPixel(act3, BX + 8, BY - 4, 5);
  setPixel(act3, BX + 22, BY - 4, 5);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 3. BARBARIAN — Brick fort + big beaver with mug
function buildBarbarianTower(): TowerPixelArt {
  const base = createBrickFortBase();
  const bx = 16;
  const by = 2;

  const idle1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addMug(idle1, bx + 14, by + 8);

  const idle2 = placeBeaverOnTower(cloneGrid(base), bx, by, true);
  addMug(idle2, bx + 14, by + 8);

  // Action 1: raise mug
  const act1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addMug(act1, bx + 14, by + 4);

  // Action 2: drinking
  const act2 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addMug(act2, bx + 10, by + 2);

  // Action 3: satisfied (mug down, sparkle)
  const act3 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addMug(act3, bx + 14, by + 8);
  addSparkles(act3, bx + 8, by - 2, 3);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 4. CAPABLE — Farm plot + beaver with hoe
function buildCapableTower(): TowerPixelArt {
  const base = createFarmPlotBase();
  const bx = 16;
  const by = 12;

  const idle1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addHoe(idle1, bx, by);

  const idle2 = placeBeaverOnTower(cloneGrid(base), bx, by, true);
  addHoe(idle2, bx, by);

  // Action 1: raise hoe
  const act1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addHoe(act1, bx, by - 2);

  // Action 2: swing hoe down
  const act2 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addHoe(act2, bx, by + 2);
  // Dirt particles
  setPixel(act2, bx + 16, by + 16, 15);
  setPixel(act2, bx + 18, by + 15, 8);

  // Action 3: new sprout appears
  const act3 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addHoe(act3, bx, by);
  setPixel(act3, bx + 16, by + 20, 11);
  setPixel(act3, bx + 16, by + 19, 12);
  setPixel(act3, bx + 17, by + 18, 11);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 5. SMART — Lab + beaver with glasses/miner hat, throws bomb
function buildSmartTower(): TowerPixelArt {
  const base = createLabBase();
  const bx = 16;
  const by = 2;

  const idle1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addGlasses(idle1, bx, by);
  addMinerHat(idle1, bx, by);

  const idle2 = placeBeaverOnTower(cloneGrid(base), bx, by, true);
  addGlasses(idle2, bx, by);
  addMinerHat(idle2, bx, by);

  // Action 1: hold bomb
  const act1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addGlasses(act1, bx, by);
  addMinerHat(act1, bx, by);
  addBomb(act1, bx + 14, by + 6);

  // Action 2: throw bomb
  const act2 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addGlasses(act2, bx, by);
  addMinerHat(act2, bx, by);
  addBomb(act2, 36, 4);

  // Action 3: explosion
  const act3 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addGlasses(act3, bx, by);
  addMinerHat(act3, bx, by);
  addExplosion(act3, 40, 6, 4);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 6. ARCHER — Wooden tower with roof + beaver with helmet & bow
function buildArcherTower(): TowerPixelArt {
  const base = createArcherTowerBase();
  const bx = 16;
  const by = 2;

  const idle1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addHelmet(idle1, bx, by);
  addBow(idle1, bx, by);

  const idle2 = placeBeaverOnTower(cloneGrid(base), bx, by, true);
  addHelmet(idle2, bx, by);
  addBow(idle2, bx, by);

  // Action 1: draw bow
  const act1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addHelmet(act1, bx, by);
  addBow(act1, bx, by);
  setPixel(act1, bx + 13, by + 7, 8); // arrow nocked

  // Action 2: release arrow
  const act2 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addHelmet(act2, bx, by);
  addBow(act2, bx, by);
  addArrow(act2, bx + 16, by + 7, 6);

  // Action 3: arrow flying far
  const act3 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addHelmet(act3, bx, by);
  addBow(act3, bx, by);
  addArrow(act3, 38, 4, 6);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 7. BLOWGUNNER — Moss-covered tower + beaver in camo
function buildBlowgunnerTower(): TowerPixelArt {
  const base = createMossTowerBase();
  const bx = 16;
  const by = 4;

  const idle1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addCamo(idle1, bx, by);

  const idle2 = placeBeaverOnTower(cloneGrid(base), bx, by, true);
  addCamo(idle2, bx, by);

  // Action 1: raise blowgun (horizontal line)
  const act1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addCamo(act1, bx, by);
  for (let x = bx + 10; x <= bx + 18; x++) {
    setPixel(act1, x, by + 6, 12); // green blowgun tube
  }

  // Action 2: blow (cheeks puffed - slightly wider face)
  const act2 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addCamo(act2, bx, by);
  for (let x = bx + 10; x <= bx + 18; x++) {
    setPixel(act2, x, by + 6, 12);
  }
  addDart(act2, bx + 20, by + 6);

  // Action 3: dart flying
  const act3 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addCamo(act3, bx, by);
  for (let x = bx + 10; x <= bx + 18; x++) {
    setPixel(act3, x, by + 6, 12);
  }
  addDart(act3, 40, 6);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 8. KNIGHT — Stone tower with banner + beaver with flag
function buildKnightTower(): TowerPixelArt {
  const base = createKnightTowerBase();
  const bx = 10;
  const by = 2;

  const idle1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addFlag(idle1, bx + 14, by, 0);

  const idle2 = placeBeaverOnTower(cloneGrid(base), bx, by, true);
  addFlag(idle2, bx + 14, by, 1);

  // Action 1: raise flag high
  const act1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addFlag(act1, bx + 14, by - 4, 0);

  // Action 2: wave flag left
  const act2 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addFlag(act2, bx + 14, by - 4, -1);

  // Action 3: wave flag right
  const act3 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addFlag(act3, bx + 14, by - 4, 1);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 9. DRAGON TAMER — Iron low tower + beaver with small dragon
function buildDragonTamerTower(): TowerPixelArt {
  const base = createIronLowTowerBase();
  const bx = 10;
  const by = 8;

  const idle1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addSmallDragon(idle1, bx + 16, by + 4);

  const idle2 = placeBeaverOnTower(cloneGrid(base), bx, by, true);
  addSmallDragon(idle2, bx + 16, by + 4);

  // Action 1: dragon perks up
  const act1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addSmallDragon(act1, bx + 16, by + 2);

  // Action 2: dragon breathes small fire
  const act2 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addSmallDragon(act2, bx + 16, by + 2);
  addFireBreath(act2, bx + 26, by + 2, 4);

  // Action 3: big fire breath
  const act3 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addSmallDragon(act3, bx + 16, by + 2);
  addFireBreath(act3, bx + 26, by + 1, 7);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 10. WIZARD — Iron tall tower + beaver with staff
function buildWizardTower(): TowerPixelArt {
  const base = createIronTallTowerBase();
  const bx = 16;
  const by = 0;

  const idle1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addStaff(idle1, bx, by);

  const idle2 = placeBeaverOnTower(cloneGrid(base), bx, by, true);
  addStaff(idle2, bx, by);

  // Action 1: raise staff
  const act1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addStaff(act1, bx, by - 2);

  // Action 2: sparkles appear at staff tip
  const act2 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addStaff(act2, bx, by - 2);
  addSparkles(act2, bx + 14, by - 4, 3);

  // Action 3: big spell cast
  const act3 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addStaff(act3, bx, by - 2);
  addSparkles(act3, bx + 14, by - 4, 5);
  addSparkles(act3, 38, 8, 3);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 11. LOG ROLLER — Brick tower with hole + beaver with glasses pulling lever
function buildLogRollerTower(): TowerPixelArt {
  const base = createLogRollerBase();
  const bx = 16;
  const by = 2;

  const idle1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addGlasses(idle1, bx, by);
  addLever(idle1, bx + 14, by + 6, false);

  const idle2 = placeBeaverOnTower(cloneGrid(base), bx, by, true);
  addGlasses(idle2, bx, by);
  addLever(idle2, bx + 14, by + 6, false);

  // Action 1: grab lever
  const act1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addGlasses(act1, bx, by);
  addLever(act1, bx + 14, by + 6, false);

  // Action 2: pull lever
  const act2 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addGlasses(act2, bx, by);
  addLever(act2, bx + 14, by + 6, true);

  // Action 3: log rolls out
  const act3 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addGlasses(act3, bx, by);
  addLever(act3, bx + 14, by + 6, true);
  addRollingLog(act3, 16, 36, 2);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// 12. WATER BOMBER — Brick tower with mortar tube + beaver
function buildWaterBomberTower(): TowerPixelArt {
  const base = createMortarTowerBase();
  const bx = 24;
  const by = 6;

  const idle1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  const idle2 = placeBeaverOnTower(cloneGrid(base), bx, by, true);

  // Action 1: load water bomb into mortar
  const act1 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addWaterBomb(act1, 20, 8);

  // Action 2: fire! smoke from mortar
  const act2 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addMortarSmoke(act2, 20, 8, 1);
  addWaterBomb(act2, 20, 4);

  // Action 3: water bomb flying + splash
  const act3 = placeBeaverOnTower(cloneGrid(base), bx, by, false);
  addMortarSmoke(act3, 20, 8, 2);
  addWaterSplash(act3, 38, 10, 3);

  return {
    idle: [freeze(idle1), freeze(idle2)],
    action: [freeze(act1), freeze(act2), freeze(act3)],
  };
}

// ─── Exported tower data ─────────────────────────────────────────────────────

export const agileTower: TowerPixelArt = buildAgileTower();
export const braveTower: TowerPixelArt = buildBraveTower();
export const barbarianTower: TowerPixelArt = buildBarbarianTower();
export const capableTower: TowerPixelArt = buildCapableTower();
export const smartTower: TowerPixelArt = buildSmartTower();
export const archerTower: TowerPixelArt = buildArcherTower();
export const blowgunnerTower: TowerPixelArt = buildBlowgunnerTower();
export const knightTower: TowerPixelArt = buildKnightTower();
export const dragonTamerTower: TowerPixelArt = buildDragonTamerTower();
export const wizardTower: TowerPixelArt = buildWizardTower();
export const logRollerTower: TowerPixelArt = buildLogRollerTower();
export const waterBomberTower: TowerPixelArt = buildWaterBomberTower();

/** Lookup map for all tower pixel art by tower type key */
export const towerPixelArt: Record<string, TowerPixelArt> = {
  agile: agileTower,
  brave: braveTower,
  barbarian: barbarianTower,
  capable: capableTower,
  smart: smartTower,
  archer: archerTower,
  blowgunner: blowgunnerTower,
  knight: knightTower,
  dragonTamer: dragonTamerTower,
  wizard: wizardTower,
  logRoller: logRollerTower,
  waterBomber: waterBomberTower,
};
