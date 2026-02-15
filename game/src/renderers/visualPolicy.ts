import type { EnemyType, TowerType, UpgradeType } from '@/types';

export const visualPolicy = {
  backgroundLandColor: 0x87b16a,
  riverColor: 0x3f8ed9,
  slotBorderColor: 0xe6f4ea,
  slotFillColor: 0x2f3b2f,
  damColor: 0x7a4f2a,
  textColor: '#ffffff',
} as const;

const enemyColorMap: Record<EnemyType, number> = {
  piranha: 0xe53935,
  catfish: 0x1e88e5,
  iguana: 0x8bc34a,
  waterSnake: 0x26c6da,
  turtle: 0x6d4c41,
  anaconda: 0xff9800,
  crocodile: 0x4e342e,
  hippo: 0x9575cd,
  elephant: 0x90a4ae,
};

const towerColorMap: Record<TowerType | UpgradeType, number> = {
  archer: 0x8d6e63,
  warrior: 0x5d4037,
  mage: 0x42a5f5,
  bomb: 0xef6c00,
  blowgunner: 0x43a047,
  crossbowman: 0x6d4c41,
  knight: 0x3949ab,
  suit: 0x212121,
  fireMage: 0xf4511e,
  iceMage: 0x29b6f6,
  logRoller: 0x795548,
  mortar: 0x616161,
};

export const getEnemyColor = (type: EnemyType): number => enemyColorMap[type];
export const getTowerColor = (type: TowerType | UpgradeType): number => towerColorMap[type];
