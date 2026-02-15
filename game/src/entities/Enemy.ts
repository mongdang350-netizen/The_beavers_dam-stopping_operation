import type { PathSystem } from '@/systems/PathSystem';
import type { AttackType, DamageResult, Effect, EnemyConfig, EnemyStatus } from '@/types';

let enemySequence = 0;

interface BlockTarget {
  takeDamage: (amount: number, attackType: AttackType) => void;
  isDead?: () => boolean;
}

const clampPositive = (value: number): number => Math.max(0, value);

export class Enemy {
  id: string;
  config: EnemyConfig;
  hp: number;
  maxHp: number;
  progress: number;
  position: { x: number; y: number };
  status: EnemyStatus;
  effects: Effect[];
  attackCooldown: number;
  private blockedTarget: BlockTarget | null;

  constructor(config: EnemyConfig) {
    this.id = `${config.id}-${enemySequence++}`;
    this.config = config;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.progress = 0;
    this.position = { x: 0, y: 0 };
    this.status = 'moving';
    this.effects = [];
    this.attackCooldown = 0;
    this.blockedTarget = null;
  }

  initialize(config: EnemyConfig): void {
    this.config = config;
    this.reset();
  }

  update(
    dt: number,
    pathSystem: PathSystem,
    handlers?: {
      onDamDamage?: (damage: number) => void;
    },
  ): void {
    if (this.status === 'dead') {
      return;
    }

    if (this.isStunned()) {
      return;
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    if (this.status === 'moving') {
      const delta = pathSystem.getSpeedAsProgress(this.getEffectiveSpeed()) * dt;
      this.progress = Math.min(1, this.progress + delta);
      this.position = pathSystem.getPositionAtProgress(this.progress);
      if (this.progress >= 1) {
        this.status = 'attackingDam';
      }
      return;
    }

    if (this.status === 'blocked') {
      if (!this.blockedTarget || this.blockedTarget.isDead?.()) {
        this.releaseBlock();
        return;
      }

      if (this.attackCooldown <= 0) {
        this.blockedTarget.takeDamage(this.config.atk, this.config.attackType);
        this.attackCooldown = this.getEffectiveAttackInterval();
      }
      return;
    }

    if (this.status === 'attackingDam' && handlers?.onDamDamage) {
      const dps = this.config.atk * this.getEffectiveAttackSpeed();
      handlers.onDamDamage(dps * dt);
    }
  }

  takeDamage(amount: number, type: AttackType): DamageResult {
    const damage = this.calculateMitigatedDamage(amount, type);
    this.hp = Math.max(0, this.hp - damage);
    const isDead = this.hp <= 0;
    if (isDead) {
      this.status = 'dead';
    }

    return {
      targetId: this.id,
      damage,
      isDead,
      goldEarned: isDead ? this.config.gold : undefined,
    };
  }

  takeTrueDamage(amount: number): DamageResult {
    const damage = clampPositive(amount);
    this.hp = Math.max(0, this.hp - damage);
    const isDead = this.hp <= 0;
    if (isDead) {
      this.status = 'dead';
    }

    return {
      targetId: this.id,
      damage,
      isDead,
      goldEarned: isDead ? this.config.gold : undefined,
    };
  }

  blockBy(target: BlockTarget): void {
    if (this.status === 'dead') {
      return;
    }
    this.blockedTarget = target;
    this.status = 'blocked';
  }

  releaseBlock(): void {
    if (this.status === 'dead') {
      return;
    }
    this.blockedTarget = null;
    if (this.status === 'blocked') {
      this.status = 'moving';
    }
  }

  applyEffect(effect: Effect): void {
    const existing = this.effects.find((item) => item.type === effect.type);
    if (existing) {
      existing.duration = effect.duration;
      existing.value = effect.value;
      existing.ignoresArmor = effect.ignoresArmor;
      return;
    }
    this.effects.push({ ...effect });
  }

  tickEffects(dt: number): void {
    if (this.effects.length === 0 || this.status === 'dead') {
      return;
    }

    for (const effect of this.effects) {
      if (effect.type === 'poison' || effect.type === 'burn') {
        const damage = effect.value * dt;
        this.takeTrueDamage(damage);
      }
      effect.duration -= dt;
    }

    this.effects = this.effects.filter((effect) => effect.duration > 0);
  }

  getEffectiveSpeed(): number {
    const slowEffects = this.effects.filter((effect) => effect.type === 'slow');
    const totalSlow = slowEffects.reduce((acc, effect) => acc + effect.value, 0);
    return Math.max(0, this.config.speed * (1 - totalSlow));
  }

  getEffectiveAttackSpeed(): number {
    const slowAttackDebuff = this.effects
      .filter((effect) => effect.type === 'slow')
      .reduce((acc, effect) => acc + effect.value * (2 / 3), 0);
    const extraAttackDebuff = this.effects
      .filter((effect) => effect.type === 'asDeBuff')
      .reduce((acc, effect) => acc + effect.value, 0);
    const multiplier = Math.max(0, 1 - slowAttackDebuff - extraAttackDebuff);
    return this.config.attackSpeed * multiplier;
  }

  getEffectiveAttackInterval(): number {
    const speed = this.getEffectiveAttackSpeed();
    return speed <= 0 ? Number.POSITIVE_INFINITY : 1 / speed;
  }

  isStunned(): boolean {
    return this.effects.some((effect) => effect.type === 'stun');
  }

  reset(): void {
    this.hp = this.config.hp;
    this.maxHp = this.config.hp;
    this.progress = 0;
    this.position = { x: 0, y: 0 };
    this.status = 'moving';
    this.effects = [];
    this.attackCooldown = 0;
    this.blockedTarget = null;
    this.id = `${this.config.id}-${enemySequence++}`;
  }

  private calculateMitigatedDamage(amount: number, type: AttackType): number {
    const mitigated = type === 'physical' ? amount - this.config.def : amount - this.config.mdef;
    return Math.max(1, mitigated);
  }
}
