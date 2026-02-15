import type { TowerType, UpgradeType } from '@/types/tower.types';

export interface GameEvents {
  enemyKilled: { enemyId: string; goldEarned: number };
  enemyReachedDam: { enemyId: string };
  towerPlaced: { slotIndex: number; towerType: TowerType };
  towerSold: { slotIndex: number; goldRefunded: number };
  towerUpgraded: { slotIndex: number; upgradeType: UpgradeType };
  waveStart: { stageId: number; waveIndex: number };
  waveEnd: { stageId: number; waveIndex: number };
  stageStart: { stageId: number };
  stageEnd: { stageId: number };
  damDamaged: { damage: number; remainingHp: number };
  gameOver: Record<string, never>;
  victory: { score: number; stars: number };
  goldChanged: { amount: number; total: number };
}
