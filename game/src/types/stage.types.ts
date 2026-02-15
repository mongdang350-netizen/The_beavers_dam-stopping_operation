import type { EnemyType } from '@/types/enemy.types';

export interface SpawnEntry {
  type: EnemyType;
  count: number;
}

export interface WaveConfig {
  enemies: SpawnEntry[];
}

export interface StageConfig {
  id: number;
  waves: [WaveConfig, WaveConfig, WaveConfig];
  bonusGold?: number;
}
