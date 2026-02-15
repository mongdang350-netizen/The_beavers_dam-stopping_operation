import type { Enemy } from '@/entities/Enemy';
import type { AttackType, Effect, Position } from '@/types';
import { distance, normalize } from '@/utils/math';

export interface ProjectileInit {
  origin: Position;
  target: Enemy | null;
  speed?: number;
  damage: number;
  attackType: AttackType;
  isAoe?: boolean;
  aoeRadius?: number;
  effect?: Effect;
  direction?: Position;
}

export class Projectile {
  origin: Position;
  target: Enemy | null;
  position: Position;
  speed: number;
  damage: number;
  attackType: AttackType;
  isAoe: boolean;
  aoeRadius: number;
  effect?: Effect;
  direction: Position;
  active: boolean;

  constructor(init: ProjectileInit) {
    this.origin = { ...init.origin };
    this.target = init.target;
    this.position = { ...init.origin };
    this.speed = init.speed ?? 800;
    this.damage = init.damage;
    this.attackType = init.attackType;
    this.isAoe = init.isAoe ?? false;
    this.aoeRadius = init.aoeRadius ?? 0;
    this.effect = init.effect ? { ...init.effect } : undefined;
    this.direction = init.direction ? normalize(init.direction) : { x: 0, y: 0 };
    this.active = true;
  }

  update(dt: number): void {
    if (!this.active) {
      return;
    }

    if (this.target && this.target.status !== 'dead') {
      const toTarget = {
        x: this.target.position.x - this.position.x,
        y: this.target.position.y - this.position.y,
      };
      const remainingDistance = Math.hypot(toTarget.x, toTarget.y);
      if (remainingDistance === 0) {
        return;
      }
      const unit = normalize(toTarget);
      const step = this.speed * dt;
      if (step >= remainingDistance) {
        this.position.x = this.target.position.x;
        this.position.y = this.target.position.y;
      } else {
        this.position.x += unit.x * step;
        this.position.y += unit.y * step;
      }
      return;
    }

    this.position.x += this.direction.x * this.speed * dt;
    this.position.y += this.direction.y * this.speed * dt;
  }

  hasReachedTarget(): boolean {
    if (!this.target) {
      return false;
    }
    return distance(this.position, this.target.position) < 5;
  }

  reset(init?: ProjectileInit): void {
    if (!init) {
      this.active = false;
      this.target = null;
      return;
    }

    this.origin = { ...init.origin };
    this.target = init.target;
    this.position = { ...init.origin };
    this.speed = init.speed ?? 800;
    this.damage = init.damage;
    this.attackType = init.attackType;
    this.isAoe = init.isAoe ?? false;
    this.aoeRadius = init.aoeRadius ?? 0;
    this.effect = init.effect ? { ...init.effect } : undefined;
    this.direction = init.direction ? normalize(init.direction) : { x: 0, y: 0 };
    this.active = true;
  }
}
