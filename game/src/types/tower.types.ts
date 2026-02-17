import type { EffectType } from '@/types/effect.types';

export type TowerFamily = 'agile' | 'brave' | 'capable' | 'smart';

export type TowerType = 'agile' | 'brave' | 'capable' | 'smart';

export type UpgradeType =
  | 'archer'
  | 'blowgunner'
  | 'knight'
  | 'barbarian'
  | 'dragonTamer'
  | 'wizard'
  | 'logRoller'
  | 'waterBomber';

export type AttackType = 'physical' | 'magic' | 'summon' | 'production' | 'aoe';
export type TargetMode = 'single' | 'aoe' | 'none';

export interface TowerSpecial {
  effectType?: EffectType;
  effectDuration?: number;
  effectValue?: number;
  summonSoldiers?: boolean;
  goldPerInterval?: number;
  goldInterval?: number;
  stunAura?: {
    cooldown: number;
    duration: number;
    radius: number;
  };
}

export interface TowerConfig {
  id: TowerType | UpgradeType;
  family: TowerFamily;
  role: 'base' | 'upgrade';
  tier: 1 | 2;
  baseTowerId?: TowerType;
  name: string;
  cost: number;
  attackType: AttackType;
  atk: number;
  attackSpeed: number;
  range: number;
  targetMode: TargetMode;
  maxTargets?: number;
  aoeRadius?: number;
  special?: TowerSpecial;
}

export interface SoldierConfig {
  count: number;
  hp: number;
  atk: number;
  attackSpeed: number;
  def: number;
  mdef: number;
  respawnTime: number;
}

export interface TowerUpgradeConfig extends TowerConfig {
  baseTowerId: TowerType;
  soldierConfig?: SoldierConfig;
}
