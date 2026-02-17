import type { Enemy } from '@/entities/Enemy';
import type { Position, TowerConfig, TowerType, UpgradeType } from '@/types';
import { RANGE_UNIT } from '@/utils/constants';
import { distance } from '@/utils/math';

const isUpgradeType = (value: TowerType | UpgradeType): value is UpgradeType => {
  return !['agile', 'brave', 'barbarian', 'capable', 'smart'].includes(value);
};

export class Tower {
  config: TowerConfig;
  readonly position: Position;
  readonly slotIndex: number;
  level: 'base' | UpgradeType;
  totalCost: number;
  attackCooldown: number;
  lastAttackTime: number;
  attackPhase: 'idle' | 'firing' | 'cooldown' = 'idle';
  private attackSpeedDebuff: number;

  constructor(config: TowerConfig, position: Position, slotIndex: number) {
    this.config = config;
    this.position = { ...position };
    this.slotIndex = slotIndex;
    this.level = isUpgradeType(config.id) ? config.id : 'base';
    this.totalCost = config.cost;
    this.attackCooldown = 0;
    this.lastAttackTime = Number.NEGATIVE_INFINITY;
    this.attackSpeedDebuff = 0;
    this.attackPhase = 'idle';
  }

  findTarget(enemies: Enemy[]): Enemy | null {
    const inRange = enemies
      .filter((enemy) => enemy.status !== 'dead')
      .filter((enemy) => distance(this.position, enemy.position) <= this.config.range * RANGE_UNIT);
    if (inRange.length === 0) {
      return null;
    }

    return inRange.reduce((best, current) => (current.progress > best.progress ? current : best));
  }

  findAoeTargets(enemies: Enemy[], primary: Enemy): Enemy[] {
    const aoeRadius = (this.config.aoeRadius ?? 0) * RANGE_UNIT;
    const maxTargets = this.config.maxTargets ?? 1;

    return enemies
      .filter((enemy) => enemy.status !== 'dead')
      .filter((enemy) => distance(primary.position, enemy.position) <= aoeRadius)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, maxTargets);
  }

  canAttack(currentTime: number): boolean {
    const effectiveAttackSpeed = this.getEffectiveAttackSpeed();
    if (effectiveAttackSpeed <= 0) {
      return false;
    }
    const interval = 1 / effectiveAttackSpeed;
    return currentTime - this.lastAttackTime >= interval;
  }

  recordAttack(currentTime: number): void {
    this.lastAttackTime = currentTime;
    this.attackPhase = 'firing';
  }

  updatePhase(currentTime: number): void {
    if (this.attackPhase === 'firing' && currentTime - this.lastAttackTime >= 0.15) {
      this.attackPhase = 'cooldown';
    }
    if (this.attackPhase === 'cooldown' && this.canAttack(currentTime)) {
      this.attackPhase = 'idle';
    }
  }

  getEffectiveAttackSpeed(): number {
    return Math.max(0.1, this.config.attackSpeed - this.attackSpeedDebuff);
  }

  setAttackSpeedDebuff(value: number): void {
    this.attackSpeedDebuff = Math.max(0, value);
  }

  applyUpgrade(config: TowerConfig): void {
    this.config = config;
    this.level = isUpgradeType(config.id) ? config.id : 'base';
    this.totalCost += config.cost;
  }
}
