// Grid-based map data: the single source of truth for map layout.
// All coordinates are integer grid positions on the 10x10 isometric grid.
// Screen coordinates are derived at runtime via IsometricUtils.toScreen().

export interface GridPoint {
  gridX: number;
  gridY: number;
}

export interface GridTowerSlot extends GridPoint {
  id: number;
}

export interface GridMapData {
  /** Ordered waypoints defining the river/enemy path through the grid. */
  waypoints: GridPoint[];
  /** Land tiles where towers can be placed. */
  towerSlots: GridTowerSlot[];
  /** Grid position of the dam (river endpoint). */
  damPosition: GridPoint;
}

/**
 * Default map: S-curve river flowing through the 10x10 grid.
 *
 * The river enters from the top-center, snakes left-right in an S-pattern,
 * and exits at the bottom where the dam is placed.
 *
 * Grid layout (approximate):
 *   Row 0:  river enters at (5, 0)
 *   Row 1-2: curves right to (8, 2)
 *   Row 3-4: curves left  to (2, 4)
 *   Row 5-6: curves right to (8, 6)
 *   Row 7-8: curves left  to (2, 8)
 *   Row 9:  exits at dam   (5, 9)
 *
 * Tower slots are placed on land tiles adjacent to the river bends,
 * giving strategic coverage of the S-curve.
 */
export const defaultGridMap: GridMapData = {
  waypoints: [
    { gridX: 5, gridY: 0 },
    { gridX: 8, gridY: 2 },
    { gridX: 2, gridY: 4 },
    { gridX: 8, gridY: 6 },
    { gridX: 2, gridY: 8 },
    { gridX: 5, gridY: 9 },
  ],
  towerSlots: [
    { id: 0, gridX: 7, gridY: 1 },
    { id: 1, gridX: 3, gridY: 3 },
    { id: 2, gridX: 7, gridY: 3 },
    { id: 3, gridX: 3, gridY: 5 },
    { id: 4, gridX: 7, gridY: 7 },
    { id: 5, gridX: 3, gridY: 7 },
  ],
  damPosition: { gridX: 5, gridY: 9 },
};
