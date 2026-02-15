import type { EffectType } from '@/types/effect.types';

export type AttackType = 'physical' | 'magical';
export type TargetMode = 'single' | 'aoe' | 'cone' | 'line';
export type TowerType = 'archer' | 'warrior' | 'mage' | 'bomb';
export type UpgradeType =
  | 'blowgunner'
  | 'crossbowman'
  | 'knight'
  | 'suit'
  | 'fireMage'
  | 'iceMage'
  | 'logRoller'
  | 'mortar';

export interface TowerSpecial {
  effectType?: EffectType;
  effectDuration?: number;
  effectValue?: number;
  summonSoldiers?: boolean;
  stunAura?: {
    cooldown: number;
    duration: number;
    radius: number;
  };
}

export interface TowerConfig {
  id: TowerType | UpgradeType;
  name: string;
  cost: number;
  attackType: AttackType;
  atk: number;
  attackSpeed: number;
  range: number;
  targetMode: TargetMode;
  maxTargets?: number;
  aoeRadius?: number;
  coneAngle?: number;
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
