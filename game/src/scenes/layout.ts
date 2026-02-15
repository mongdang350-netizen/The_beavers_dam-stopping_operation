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
