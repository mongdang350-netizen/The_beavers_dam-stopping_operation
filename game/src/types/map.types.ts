import type { Position } from '@/types/combat.types';

export interface TowerSlot extends Position {
  id: number;
}

export interface MapConfig {
  waypoints: Position[];
  towerSlots: TowerSlot[];
  damPosition: Position;
}

