import type { Enemy } from '@/entities/Enemy';

export class EffectSystem {
  update(dt: number, enemies: Enemy[]): void {
    enemies.forEach((enemy) => enemy.tickEffects(dt));
  }
}

