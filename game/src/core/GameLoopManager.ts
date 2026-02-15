import type { GameState } from '@/core/GameState';
import type { CombatSystem } from '@/systems/CombatSystem';
import type { EffectSystem } from '@/systems/EffectSystem';
import type { PathSystem } from '@/systems/PathSystem';

interface Updatable {
  update: (dt: number) => void;
}

interface Checker {
  check: () => void;
}

export class GameLoopManager {
  constructor(
    private readonly gameState: GameState,
    private readonly pathSystem: PathSystem,
    private readonly combatSystem: CombatSystem,
    private readonly effectSystem: EffectSystem,
    private readonly spawnSystem?: Updatable,
    private readonly waveSystem?: Checker,
    private readonly stageSystem?: Checker,
    private readonly soldierSystem?: Updatable,
  ) {}

  update(dt: number): void {
    if (this.gameState.gameStatus === 'paused') {
      return;
    }

    this.spawnSystem?.update(dt);
    this.gameState.enemies.forEach((enemy) =>
      enemy.update(dt, this.pathSystem, {
        onDamDamage: (damage) => this.gameState.damageDam(damage),
      }),
    );
    this.soldierSystem?.update(dt);
    this.combatSystem.update(dt, this.gameState, this.pathSystem);
    this.effectSystem.update(dt, this.gameState.enemies);
    this.waveSystem?.check();
    this.stageSystem?.check();
    this.gameState.elapsedTime += dt;
  }
}
