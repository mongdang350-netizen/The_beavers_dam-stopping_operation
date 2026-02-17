import type { DamageCalculator } from '@/core/DamageCalculator';
import type { EventBus } from '@/core/EventBus';
import type { GameState } from '@/core/GameState';
import type { GoldManager } from '@/core/GoldManager';
import type { Enemy } from '@/entities/Enemy';
import { Projectile } from '@/entities/Projectile';
import type { Tower } from '@/entities/Tower';
import type { PathSystem } from '@/systems/PathSystem';
import type { EffectSystem } from '@/systems/EffectSystem';
import type { AttackType, GameEvents } from '@/types';
import { ObjectPool } from '@/utils/ObjectPool';
import { RANGE_UNIT } from '@/utils/constants';
import { distance } from '@/utils/math';

export class CombatSystem {
  private currentTime = 0;
  private readonly projectilePool: ObjectPool<Projectile>;

  constructor(
    private readonly damageCalculator: DamageCalculator,
    _effectSystem: EffectSystem,
    private readonly eventBus: EventBus<GameEvents>,
    private readonly goldManager?: GoldManager,
    private readonly enemyPool?: ObjectPool<Enemy>,
  ) {
    this.projectilePool = new ObjectPool(
      () =>
        new Projectile({
          origin: { x: 0, y: 0 },
          target: null,
          damage: 0,
          attackType: 'physical',
        }),
      (projectile) => projectile.reset(),
    );
  }

  update(dt: number, gameState: GameState, _pathSystem: PathSystem): void {
    this.currentTime += dt;
    const enemies = gameState.enemies.filter((enemy) => enemy.status !== 'dead');

    this.applyAnacondaDebuff(gameState.towers.values(), enemies);

    gameState.towers.forEach((tower) => {
      const target = tower.findTarget(enemies);
      if (!target) {
        return;
      }

      if (!tower.canAttack(this.currentTime)) {
        return;
      }

      tower.recordAttack(this.currentTime);
      this.spawnProjectile(gameState, tower, target);
    });

    this.updateProjectiles(dt, gameState, enemies);

    // Dam damage is handled by Enemy.update() via GameLoopManager callback
    // Removed duplicate damage application here to fix bug

    this.handleEnemyDeaths(gameState);
  }

  private applyAnacondaDebuff(towers: IterableIterator<Tower>, enemies: Enemy[]): void {
    const anacondas = enemies.filter(
      (enemy) => enemy.config.id === 'anaconda' && enemy.config.special?.towerAttackSpeedDebuff,
    );
    for (const tower of towers) {
      let debuff = 0;
      for (const anaconda of anacondas) {
        const special = anaconda.config.special?.towerAttackSpeedDebuff;
        if (!special) {
          continue;
        }
        if (distance(tower.position, anaconda.position) <= special.radius * RANGE_UNIT) {
          debuff = Math.max(debuff, special.value);
        }
      }
      tower.setAttackSpeedDebuff(debuff);
    }
  }

  private applyDamage(amount: number, attackType: AttackType, enemy: Enemy, raw = false): void {
    if (enemy.status === 'dead') {
      return;
    }
    if (raw) {
      enemy.takeTrueDamage(amount);
      return;
    }

    const damage = this.damageCalculator.calculateDamage(
      amount,
      attackType,
      enemy.config.def,
      enemy.config.mdef,
    );
    enemy.takeTrueDamage(damage);
  }

  private handleEnemyDeaths(gameState: GameState): void {
    const survivors: Enemy[] = [];
    for (const enemy of gameState.enemies) {
      if (enemy.status !== 'dead') {
        survivors.push(enemy);
        continue;
      }

      this.goldManager?.earn(enemy.config.gold);
      this.eventBus.emit('enemyKilled', { enemyId: enemy.id, goldEarned: enemy.config.gold });
      this.enemyPool?.release(enemy);
    }
    gameState.enemies = survivors;
  }

  private shouldIgnoreArmor(effectType: string): boolean {
    return effectType === 'poison' || effectType === 'burn';
  }

  private spawnProjectile(gameState: GameState, tower: Tower, target: Enemy): void {
    const projectile = this.projectilePool.acquire();
    projectile.reset({
      origin: tower.position,
      target,
      damage: tower.config.atk,
      attackType: tower.config.attackType,
      isAoe: tower.config.targetMode === 'aoe',
      aoeRadius: (tower.config.aoeRadius ?? 0) * RANGE_UNIT,
      sourceType: tower.config.id,
      effect: tower.config.special?.effectType
        ? {
            type: tower.config.special.effectType,
            duration: tower.config.special.effectDuration ?? 0,
            value: tower.config.special.effectValue ?? 0,
            ignoresArmor: this.shouldIgnoreArmor(tower.config.special.effectType),
          }
        : undefined,
    });
    gameState.projectiles.push(projectile);
  }

  private updateProjectiles(dt: number, gameState: GameState, enemies: Enemy[]): void {
    const activeProjectiles: Projectile[] = [];
    for (const projectile of gameState.projectiles) {
      projectile.update(dt);
      if (!projectile.target || projectile.target.status === 'dead') {
        this.projectilePool.release(projectile);
        continue;
      }

      if (!projectile.hasReachedTarget()) {
        activeProjectiles.push(projectile);
        continue;
      }

      if (projectile.isAoe && projectile.aoeRadius > 0) {
        const hits = enemies.filter(
          (enemy) =>
            enemy.status !== 'dead' &&
            distance(enemy.position, projectile.target!.position) <= projectile.aoeRadius,
        );
        hits.forEach((enemy) => {
          this.applyDamage(projectile.damage, projectile.attackType, enemy);
          if (projectile.effect) {
            enemy.applyEffect(projectile.effect);
          }
        });
      } else {
        this.applyDamage(projectile.damage, projectile.attackType, projectile.target);
        if (projectile.effect) {
          projectile.target.applyEffect(projectile.effect);
        }
      }

      this.projectilePool.release(projectile);
    }

    gameState.projectiles = activeProjectiles;
  }
}
