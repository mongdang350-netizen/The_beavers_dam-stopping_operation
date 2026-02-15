import type { AttackType } from '@/types';

export class DamageCalculator {
  calculateDamage(atk: number, attackType: AttackType, def: number, mdef: number): number {
    if (attackType === 'physical') {
      return Math.max(1, atk - def);
    }

    return Math.max(1, atk - mdef);
  }

  calculatePoisonDamage(dps: number): number {
    return Math.max(0, dps);
  }
}
