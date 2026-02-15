import type { AttackType } from '@/types/tower.types';

export type EnemyType =
  | 'piranha'
  | 'catfish'
  | 'iguana'
  | 'waterSnake'
  | 'turtle'
  | 'anaconda'
  | 'crocodile'
  | 'hippo'
  | 'elephant';

export type EnemyStatus = 'moving' | 'blocked' | 'attackingDam' | 'dead';

export interface EnemySpecial {
  towerAttackSpeedDebuff?: {
    radius: number;
    value: number;
  };
}

export interface EnemyConfig {
  id: EnemyType;
  name: string;
  hp: number;
  speed: number;
  attackType: AttackType;
  atk: number;
  attackSpeed: number;
  def: number;
  mdef: number;
  gold: number;
  isBoss: boolean;
  sizeMultiplier: number;
  spawnInterval: number;
  category: 'weak' | 'mid' | 'strong' | 'boss';
  special?: EnemySpecial;
}
