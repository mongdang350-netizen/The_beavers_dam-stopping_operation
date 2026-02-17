// Core principle: Game logic uses grid coordinates, only rendering uses screen coordinates.
// Tile dimensions: 64 wide x 32 tall (2:1 diamond ratio)

export const ISO_TILE_WIDTH = 64;
export const ISO_TILE_HEIGHT = 32;

// Grid origin offset (center of screen horizontally, top padding vertically)
export const ISO_ORIGIN_X = 640; // GAME_WIDTH / 2
export const ISO_ORIGIN_Y = 80;

export interface GridPosition {
  gridX: number;
  gridY: number;
}

export interface ScreenPosition {
  screenX: number;
  screenY: number;
}

/**
 * Convert grid coordinates to screen (isometric) coordinates.
 *
 * Standard 2:1 isometric projection:
 *   screenX = origin_x + (gridX - gridY) * (tileWidth / 2)
 *   screenY = origin_y + (gridX + gridY) * (tileHeight / 2)
 */
export function toScreen(gridX: number, gridY: number): ScreenPosition {
  const halfW = ISO_TILE_WIDTH / 2;
  const halfH = ISO_TILE_HEIGHT / 2;
  return {
    screenX: ISO_ORIGIN_X + (gridX - gridY) * halfW,
    screenY: ISO_ORIGIN_Y + (gridX + gridY) * halfH,
  };
}

/**
 * Convert screen coordinates back to grid coordinates.
 *
 * Inverse of the isometric projection:
 *   gridX = dx / tileWidth + dy / tileHeight
 *   gridY = dy / tileHeight - dx / tileWidth
 *
 * where dx = screenX - origin_x, dy = screenY - origin_y
 */
export function toGrid(screenX: number, screenY: number): GridPosition {
  const dx = screenX - ISO_ORIGIN_X;
  const dy = screenY - ISO_ORIGIN_Y;
  return {
    gridX: dx / ISO_TILE_WIDTH + dy / ISO_TILE_HEIGHT,
    gridY: dy / ISO_TILE_HEIGHT - dx / ISO_TILE_WIDTH,
  };
}

/**
 * Calculate render depth based on grid position.
 * Higher values (further down-right on the grid) are rendered on top.
 */
export function getDepth(gridX: number, gridY: number): number {
  return gridX + gridY;
}

/**
 * Determine which grid cell a screen click hits.
 * Returns null if the position falls outside the grid bounds [0, gridCols) x [0, gridRows).
 *
 * The isometric transform maps each diamond-shaped tile to an axis-aligned
 * unit square [n, n+1) x [m, m+1) in grid space. Therefore Math.floor on
 * the fractional grid coordinates directly identifies the containing cell.
 */
export function getClickTarget(
  screenX: number,
  screenY: number,
  gridCols: number,
  gridRows: number,
): GridPosition | null {
  const { gridX, gridY } = toGrid(screenX, screenY);

  const cellX = Math.floor(gridX);
  const cellY = Math.floor(gridY);

  if (cellX < 0 || cellX >= gridCols || cellY < 0 || cellY >= gridRows) {
    return null;
  }

  return { gridX: cellX, gridY: cellY };
}

/**
 * Snap a screen position to the nearest valid grid cell (integer coordinates).
 */
export function snapToGrid(screenX: number, screenY: number): GridPosition {
  const { gridX, gridY } = toGrid(screenX, screenY);
  return {
    gridX: Math.round(gridX),
    gridY: Math.round(gridY),
  };
}
