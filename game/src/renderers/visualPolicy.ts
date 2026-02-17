import type { EnemyType, TowerType, UpgradeType } from '@/types';

export const visualPolicy = {
  backgroundLandColor: 0xa8d8a8,   // GRASS_LIGHT from pastel palette
  riverColor: 0x5ba3d9,            // RIVER_DARK from pastel palette
  slotBorderColor: 0xe6f4ea,
  slotFillColor: 0x2f3b2f,
  damColor: 0xd4a76a,              // WOOD_LIGHT from pastel palette
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
  agile: 0x8d6e63,
  brave: 0x5d4037,
  barbarian: 0xbf360c,
  capable: 0x42a5f5,
  smart: 0xef6c00,
  archer: 0x6d4c41,
  blowgunner: 0x43a047,
  knight: 0x3949ab,
  dragonTamer: 0xf4511e,
  wizard: 0x29b6f6,
  logRoller: 0x795548,
  waterBomber: 0x616161,
};

export const getEnemyColor = (type: EnemyType): number => enemyColorMap[type];
export const getTowerColor = (type: TowerType | UpgradeType): number => towerColorMap[type];
