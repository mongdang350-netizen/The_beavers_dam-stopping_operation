import {
  ISO_TILE_WIDTH,
  ISO_TILE_HEIGHT,
  ISO_ORIGIN_X,
  ISO_ORIGIN_Y,
  toScreen,
  toGrid,
  getDepth,
  getClickTarget,
  snapToGrid,
} from '@/core/IsometricUtils';

describe('IsometricUtils', () => {
  describe('toScreen', () => {
    it('maps origin (0,0) to the screen origin offset', () => {
      const pos = toScreen(0, 0);
      expect(pos.screenX).toBe(ISO_ORIGIN_X);
      expect(pos.screenY).toBe(ISO_ORIGIN_Y);
    });

    it('shifts right-down for positive gridX', () => {
      const pos = toScreen(1, 0);
      expect(pos.screenX).toBe(ISO_ORIGIN_X + ISO_TILE_WIDTH / 2);
      expect(pos.screenY).toBe(ISO_ORIGIN_Y + ISO_TILE_HEIGHT / 2);
    });

    it('shifts left-down for positive gridY', () => {
      const pos = toScreen(0, 1);
      expect(pos.screenX).toBe(ISO_ORIGIN_X - ISO_TILE_WIDTH / 2);
      expect(pos.screenY).toBe(ISO_ORIGIN_Y + ISO_TILE_HEIGHT / 2);
    });

    it('handles equal gridX and gridY (straight down)', () => {
      const pos = toScreen(3, 3);
      expect(pos.screenX).toBe(ISO_ORIGIN_X); // x offsets cancel
      expect(pos.screenY).toBe(ISO_ORIGIN_Y + 3 * ISO_TILE_HEIGHT);
    });
  });

  describe('toGrid', () => {
    it('maps screen origin offset back to grid (0,0)', () => {
      const pos = toGrid(ISO_ORIGIN_X, ISO_ORIGIN_Y);
      expect(pos.gridX).toBeCloseTo(0);
      expect(pos.gridY).toBeCloseTo(0);
    });

    it('inverts toScreen for integer grid coords', () => {
      const screen = toScreen(4, 7);
      const grid = toGrid(screen.screenX, screen.screenY);
      expect(grid.gridX).toBeCloseTo(4);
      expect(grid.gridY).toBeCloseTo(7);
    });
  });

  describe('round-trip: toScreen -> toGrid', () => {
    const cases: [number, number][] = [
      [0, 0],
      [1, 0],
      [0, 1],
      [5, 3],
      [10, 10],
      [-2, 3],
      [0, -5],
      [-4, -4],
    ];

    it.each(cases)('toGrid(toScreen(%i, %i)) returns original', (gx, gy) => {
      const screen = toScreen(gx, gy);
      const grid = toGrid(screen.screenX, screen.screenY);
      expect(grid.gridX).toBeCloseTo(gx);
      expect(grid.gridY).toBeCloseTo(gy);
    });
  });

  describe('round-trip: toGrid -> toScreen', () => {
    const cases: [number, number][] = [
      [ISO_ORIGIN_X, ISO_ORIGIN_Y],
      [ISO_ORIGIN_X + 64, ISO_ORIGIN_Y + 32],
      [ISO_ORIGIN_X - 128, ISO_ORIGIN_Y + 96],
    ];

    it.each(cases)('toScreen(toGrid(%i, %i)) returns original', (sx, sy) => {
      const grid = toGrid(sx, sy);
      const screen = toScreen(grid.gridX, grid.gridY);
      expect(screen.screenX).toBeCloseTo(sx);
      expect(screen.screenY).toBeCloseTo(sy);
    });
  });

  describe('getDepth', () => {
    it('returns sum of grid coordinates', () => {
      expect(getDepth(0, 0)).toBe(0);
      expect(getDepth(3, 4)).toBe(7);
    });

    it('orders tiles correctly: further tiles have higher depth', () => {
      expect(getDepth(1, 1)).toBeGreaterThan(getDepth(0, 0));
      expect(getDepth(2, 3)).toBeGreaterThan(getDepth(1, 1));
    });

    it('handles negative coordinates', () => {
      expect(getDepth(-1, -1)).toBe(-2);
      expect(getDepth(-1, 2)).toBe(1);
    });
  });

  describe('getClickTarget', () => {
    const COLS = 10;
    const ROWS = 10;

    it('returns correct cell for click at tile center', () => {
      // Get screen center of tile (3, 5)
      const center = toScreen(3, 5);
      const result = getClickTarget(center.screenX, center.screenY, COLS, ROWS);
      expect(result).not.toBeNull();
      expect(result!.gridX).toBe(3);
      expect(result!.gridY).toBe(5);
    });

    it('returns correct cell for tile (0, 0) center', () => {
      const center = toScreen(0, 0);
      const result = getClickTarget(center.screenX, center.screenY, COLS, ROWS);
      expect(result).not.toBeNull();
      expect(result!.gridX).toBe(0);
      expect(result!.gridY).toBe(0);
    });

    it('returns null for click outside grid (negative coords)', () => {
      const outside = toScreen(-1, 0);
      const result = getClickTarget(outside.screenX, outside.screenY, COLS, ROWS);
      expect(result).toBeNull();
    });

    it('returns null for click outside grid (beyond bounds)', () => {
      const outside = toScreen(COLS, ROWS);
      const result = getClickTarget(outside.screenX, outside.screenY, COLS, ROWS);
      expect(result).toBeNull();
    });

    it('returns null for click far from any tile', () => {
      const result = getClickTarget(0, 0, COLS, ROWS);
      expect(result).toBeNull();
    });

    it('handles the last valid cell', () => {
      const center = toScreen(COLS - 1, ROWS - 1);
      const result = getClickTarget(center.screenX, center.screenY, COLS, ROWS);
      expect(result).not.toBeNull();
      expect(result!.gridX).toBe(COLS - 1);
      expect(result!.gridY).toBe(ROWS - 1);
    });
  });

  describe('snapToGrid', () => {
    it('snaps screen origin to grid (0, 0)', () => {
      const result = snapToGrid(ISO_ORIGIN_X, ISO_ORIGIN_Y);
      expect(result.gridX).toBe(0);
      expect(result.gridY).toBe(0);
    });

    it('snaps exact tile centers to correct cells', () => {
      const center = toScreen(4, 7);
      const result = snapToGrid(center.screenX, center.screenY);
      expect(result.gridX).toBe(4);
      expect(result.gridY).toBe(7);
    });

    it('snaps slightly offset positions to nearest cell', () => {
      const center = toScreen(2, 3);
      // Small offset that should still snap to (2, 3)
      const result = snapToGrid(center.screenX + 5, center.screenY + 2);
      expect(result.gridX).toBe(2);
      expect(result.gridY).toBe(3);
    });

    it('handles large coordinates', () => {
      const center = toScreen(100, 200);
      const result = snapToGrid(center.screenX, center.screenY);
      expect(result.gridX).toBe(100);
      expect(result.gridY).toBe(200);
    });

    it('handles negative grid results', () => {
      // A screen position that maps to negative grid coords
      const result = snapToGrid(ISO_ORIGIN_X - 500, ISO_ORIGIN_Y);
      expect(result.gridX).toBeLessThan(0);
    });
  });

  describe('constants', () => {
    it('has 2:1 tile ratio', () => {
      expect(ISO_TILE_WIDTH).toBe(2 * ISO_TILE_HEIGHT);
    });

    it('has expected tile dimensions', () => {
      expect(ISO_TILE_WIDTH).toBe(64);
      expect(ISO_TILE_HEIGHT).toBe(32);
    });

    it('has origin at center width of game', () => {
      expect(ISO_ORIGIN_X).toBe(640);
      expect(ISO_ORIGIN_Y).toBe(80);
    });
  });
});
