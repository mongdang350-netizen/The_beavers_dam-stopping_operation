import type { Enemy } from '@/entities/Enemy';
import type { AttackType, Position, SoldierConfig } from '@/types';
import { RANGE_UNIT } from '@/utils/constants';
import { distance, normalize } from '@/utils/math';

export type SoldierStatus = 'idle' | 'movingToRally' | 'engaging' | 'dead';

interface StunAuraConfig {
  cooldown: number;
  duration: number;
  radius: number;
}

const SOLDIER_MOVE_SPEED = 128;

export class Soldier {
  readonly config: SoldierConfig;
  readonly type: 'brave' | 'knight' | 'barbarian';
  position: Position;
  rallyPoint: Position;
  status: SoldierStatus;
  target: Enemy | null;
  hp: number;
  attackCooldown: number;
  respawnTimer: number;
  private readonly spawnPoint: Position;
  private readonly stunAura?: StunAuraConfig;
  private stunCooldown: number;

  constructor(config: SoldierConfig, type: 'brave' | 'knight' | 'barbarian', spawnPoint: Position, rallyPoint: Position, stunAura?: StunAuraConfig) {
    this.config = config;
    this.type = type;
    this.spawnPoint = { ...spawnPoint };
    this.position = { ...spawnPoint };
    this.rallyPoint = { ...rallyPoint };
    this.status = 'movingToRally';
    this.target = null;
    this.hp = config.hp;
    this.attackCooldown = 0;
    this.respawnTimer = 0;
    this.stunAura = stunAura;
    this.stunCooldown = stunAura?.cooldown ?? 0;
  }

  setRallyPoint(rallyPoint: Position): void {
    const dx = this.rallyPoint.x - rallyPoint.x;
    const dy = this.rallyPoint.y - rallyPoint.y;
    this.rallyPoint = { ...rallyPoint };
    if (this.status === 'idle' && Math.hypot(dx, dy) > 1) {
      this.status = 'movingToRally';
    }
  }

  update(dt: number, enemies: Enemy[]): void {
    if (this.status === 'dead') {
      this.respawnTimer = Math.max(0, this.respawnTimer - dt);
      if (this.respawnTimer <= 0 && this.hp <= 0) {
        this.hp = this.config.hp;
        this.position = { ...this.spawnPoint };
        this.status = 'movingToRally';
      }
      return;
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.tickStunAura(dt, enemies);

    if (this.status === 'movingToRally') {
      this.moveToward(this.rallyPoint, dt);
      if (distance(this.position, this.rallyPoint) <= 2) {
        this.status = 'idle';
      }
      return;
    }

    if (this.status === 'idle') {
      const candidate = enemies.find(
        (enemy) =>
          enemy.status === 'moving' &&
          distance(this.rallyPoint, enemy.position) <= 1.5 * RANGE_UNIT &&
          !enemy.isStunned(),
      );
      if (candidate) {
        this.engage(candidate);
      }
      return;
    }

    if (this.status === 'engaging') {
      if (!this.target || this.target.status === 'dead') {
        this.disengage();
        return;
      }

      if (this.attackCooldown <= 0) {
        this.target.takeDamage(this.config.atk, 'physical');
        this.attackCooldown = 1 / this.config.attackSpeed;
      }

      const incomingDps = this.target.config.atk * this.target.getEffectiveAttackSpeed();
      this.takeDamage(incomingDps * dt, this.target.config.attackType);
      if (this.hp <= 0) {
        this.die();
      }
    }
  }

  private moveToward(target: Position, dt: number): void {
    const toTarget = { x: target.x - this.position.x, y: target.y - this.position.y };
    const len = Math.hypot(toTarget.x, toTarget.y);
    if (len === 0) {
      return;
    }
    const dir = normalize(toTarget);
    const step = Math.min(len, SOLDIER_MOVE_SPEED * dt);
    this.position = {
      x: this.position.x + dir.x * step,
      y: this.position.y + dir.y * step,
    };
  }

  private engage(enemy: Enemy): void {
    this.target = enemy;
    this.status = 'engaging';
    enemy.blockBy({
      takeDamage: (amount: number, attackType: AttackType) => {
        this.takeDamage(amount, attackType);
      },
      isDead: () => this.status === 'dead',
    });
  }

  private disengage(): void {
    this.target?.releaseBlock();
    this.target = null;
    this.status = 'idle';
  }

  private die(): void {
    this.target?.releaseBlock();
    this.target = null;
    this.status = 'dead';
    this.respawnTimer = this.config.respawnTime;
  }

  private takeDamage(amount: number, attackType: AttackType): void {
    const mitigation = attackType === 'physical' ? this.config.def : this.config.mdef;
    const effective = Math.max(1, amount - mitigation);
    this.hp = Math.max(0, this.hp - effective);
  }

  private tickStunAura(dt: number, enemies: Enemy[]): void {
    if (!this.stunAura) {
      return;
    }
    this.stunCooldown -= dt;
    if (this.stunCooldown > 0) {
      return;
    }

    const radius = this.stunAura.radius * RANGE_UNIT;
    for (const enemy of enemies) {
      if (enemy.status === 'dead') {
        continue;
      }
      if (distance(this.position, enemy.position) <= radius) {
        enemy.applyEffect({
          type: 'stun',
          duration: this.stunAura.duration,
          value: 0,
          ignoresArmor: true,
        });
      }
    }
    this.stunCooldown = this.stunAura.cooldown;
  }
}

export class SoldierSquad {
  private readonly soldiers: Soldier[];

  constructor(
    config: SoldierConfig,
    type: 'brave' | 'knight' | 'barbarian',
    count: number,
    spawnPoint: Position,
    rallyPoint: Position,
    stunAura?: StunAuraConfig,
  ) {
    this.soldiers = Array.from(
      { length: count },
      () => new Soldier(config, type, spawnPoint, rallyPoint, stunAura),
    );
  }

  update(dt: number, enemies: Enemy[]): void {
    this.soldiers.forEach((soldier) => soldier.update(dt, enemies));
  }

  setRallyPoint(rallyPoint: Position): void {
    this.soldiers.forEach((soldier) => soldier.setRallyPoint(rallyPoint));
  }

  getSoldiers(): Soldier[] {
    return this.soldiers;
  }
}
