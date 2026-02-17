import { DamageCalculator } from '@/core/DamageCalculator';
import { EventBus } from '@/core/EventBus';
import { GameLoopManager } from '@/core/GameLoopManager';
import { GameState, type GameStatus } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import { ScoreCalculator } from '@/core/ScoreCalculator';
import { enemiesData, mapsData, stagesData, towersData } from '@/data/validatedData';
import { EnemyFactory } from '@/entities/EnemyFactory';
import { TowerFactory } from '@/entities/TowerFactory';
import { CombatSystem } from '@/systems/CombatSystem';
import { EffectSystem } from '@/systems/EffectSystem';
import { PathSystem } from '@/systems/PathSystem';
import { SoldierSystem } from '@/systems/SoldierSystem';
import { SpawnSystem } from '@/systems/SpawnSystem';
import { StageSystem } from '@/systems/StageSystem';
import { TowerPlacementSystem } from '@/systems/TowerPlacementSystem';
import { UpgradeSystem } from '@/systems/UpgradeSystem';
import { WaveSystem } from '@/systems/WaveSystem';
import type { GameEvents, TowerType, UpgradeType } from '@/types';
import { INITIAL_GOLD } from '@/utils/constants';
import { ObjectPool } from '@/utils/ObjectPool';

export class GameSession {
  readonly eventBus: EventBus<GameEvents>;
  readonly goldManager: GoldManager;
  readonly gameState: GameState;
  readonly pathSystem: PathSystem;
  readonly waveSystem: WaveSystem;
  readonly stageSystem: StageSystem;
  readonly placementSystem: TowerPlacementSystem;
  readonly upgradeSystem: UpgradeSystem;
  readonly soldierSystem: SoldierSystem;

  private readonly gameLoopManager: GameLoopManager;
  private pausedBefore: Extract<GameStatus, 'preparing' | 'playing'> = 'preparing';
  private readonly towerCostById = new Map(towersData.map((tower) => [tower.id, tower.cost]));

  constructor() {
    this.eventBus = new EventBus<GameEvents>();
    this.goldManager = new GoldManager(this.eventBus, INITIAL_GOLD);
    this.gameState = new GameState(this.eventBus, this.goldManager);
    this.pathSystem = new PathSystem(mapsData.defaultMap);

    const enemyPool = new ObjectPool(
      () => new EnemyFactory().createEnemy('piranha'),
      (enemy) => enemy.reset(),
    );

    const towerFactory = new TowerFactory();
    const enemyFactory = new EnemyFactory();
    const spawnSystem = new SpawnSystem(enemyFactory, this.pathSystem, enemyPool);
    this.waveSystem = new WaveSystem(this.gameState, spawnSystem, this.eventBus);
    this.stageSystem = new StageSystem(
      this.gameState,
      this.waveSystem,
      stagesData,
      new ScoreCalculator(),
      enemiesData,
      this.goldManager,
      this.eventBus,
    );
    const effectSystem = new EffectSystem();
    this.soldierSystem = new SoldierSystem(this.gameState);
    const combatSystem = new CombatSystem(
      new DamageCalculator(),
      effectSystem,
      this.eventBus,
      this.goldManager,
      enemyPool,
    );
    this.gameLoopManager = new GameLoopManager(
      this.gameState,
      this.pathSystem,
      combatSystem,
      effectSystem,
      spawnSystem,
      this.waveSystem,
      this.stageSystem,
      this.soldierSystem,
    );

    this.placementSystem = new TowerPlacementSystem(
      this.gameState,
      this.goldManager,
      towerFactory,
      this.pathSystem,
      this.eventBus,
    );
    this.upgradeSystem = new UpgradeSystem(
      this.gameState,
      this.goldManager,
      towerFactory,
      this.eventBus,
    );

    this.stageSystem.start();
  }

  update(dt: number): void {
    const scaledDt = dt * this.gameState.speed;
    this.gameLoopManager.update(scaledDt);
  }

  startWave(): boolean {
    return this.stageSystem.startCurrentWave();
  }

  placeTower(slotIndex: number, towerType: TowerType): boolean {
    return this.placementSystem.placeTower(slotIndex, towerType);
  }

  sellTower(slotIndex: number): number {
    return this.placementSystem.sellTower(slotIndex);
  }

  upgradeTower(slotIndex: number, upgradeType: UpgradeType): boolean {
    return this.upgradeSystem.upgradeTower(slotIndex, upgradeType);
  }

  toggleSpeed(): void {
    this.gameState.setSpeed(this.gameState.speed === 1 ? 2 : 1);
  }

  setSpeed(speed: 1 | 2): void {
    this.gameState.setSpeed(speed);
  }

  togglePause(): void {
    if (this.gameState.gameStatus === 'paused') {
      this.gameState.setStatus(this.pausedBefore);
      return;
    }

    if (this.gameState.gameStatus === 'preparing' || this.gameState.gameStatus === 'playing') {
      this.pausedBefore = this.gameState.gameStatus;
      this.gameState.setStatus('paused');
    }
  }

  getUpgradeCost(upgradeType: UpgradeType): number {
    return this.towerCostById.get(upgradeType) ?? 0;
  }

  setRallyPoint(slotIndex: number, x: number, y: number): boolean {
    const squad = this.soldierSystem.getSquad(slotIndex);
    if (!squad) {
      return false;
    }
    squad.setRallyPoint({ x, y });
    return true;
  }
}
