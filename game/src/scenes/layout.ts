// Layout builder: converts map data into screen-coordinate layout for rendering.
//
// Design principle: grid data is the source of truth, screen coordinates are derived.
// buildLayoutFromGrid() is the preferred entry point for new code.

import { toScreen } from '@/core/IsometricUtils';
import type { GridMapData } from '@/data/gridMaps';
import type { MapConfig, Position, TowerSlot } from '@/types';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';

export interface GameSceneLayout {
  bounds: {
    width: number;
    height: number;
  };
  riverPath: Position[];
  slots: TowerSlot[];
  damPosition: Position;
}

/**
 * Build layout from legacy screen-coordinate MapConfig.
 * Retained for backward compatibility with existing GameScene.
 */
export const buildGameSceneLayout = (map: MapConfig): GameSceneLayout => {
  return {
    bounds: {
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    riverPath: map.waypoints.map((point) => ({ ...point })),
    slots: map.towerSlots.map((slot) => ({ ...slot })),
    damPosition: { ...map.damPosition },
  };
};

/**
 * Build layout from grid-based map data (preferred).
 *
 * Converts grid coordinates to screen coordinates via IsometricUtils.toScreen(),
 * producing a GameSceneLayout that renderers and UI systems can consume directly.
 */
export function buildLayoutFromGrid(gridMap: GridMapData): GameSceneLayout {
  const riverPath: Position[] = gridMap.waypoints.map((wp) => {
    const { screenX, screenY } = toScreen(wp.gridX, wp.gridY);
    return { x: screenX, y: screenY };
  });

  const slots: TowerSlot[] = gridMap.towerSlots.map((slot) => {
    const { screenX, screenY } = toScreen(slot.gridX, slot.gridY);
    return { id: slot.id, x: screenX, y: screenY };
  });

  const { screenX, screenY } = toScreen(
    gridMap.damPosition.gridX,
    gridMap.damPosition.gridY,
  );
  const damPosition: Position = { x: screenX, y: screenY };

  return {
    bounds: {
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    riverPath,
    slots,
    damPosition,
  };
}

/**
 * Convert a GridMapData into a MapConfig (screen coordinates).
 *
 * This is useful when other systems (e.g. PathSystem) need a MapConfig
 * derived from grid data rather than from the legacy maps.json.
 */
export function gridMapToMapConfig(gridMap: GridMapData): MapConfig {
  const waypoints: Position[] = gridMap.waypoints.map((wp) => {
    const { screenX, screenY } = toScreen(wp.gridX, wp.gridY);
    return { x: screenX, y: screenY };
  });

  const towerSlots: TowerSlot[] = gridMap.towerSlots.map((slot) => {
    const { screenX, screenY } = toScreen(slot.gridX, slot.gridY);
    return { id: slot.id, x: screenX, y: screenY };
  });

  const { screenX, screenY } = toScreen(
    gridMap.damPosition.gridX,
    gridMap.damPosition.gridY,
  );
  const damPosition: Position = { x: screenX, y: screenY };

  return { waypoints, towerSlots, damPosition };
}
