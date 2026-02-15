import { EventBus } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import { ScoreCalculator } from '@/core/ScoreCalculator';
import { enemiesData, stagesData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { EnemyFactory } from '@/entities/EnemyFactory';
import { PathSystem } from '@/systems/PathSystem';
import { SpawnSystem } from '@/systems/SpawnSystem';
import { StageSystem } from '@/systems/StageSystem';
import { WaveSystem } from '@/systems/WaveSystem';
import { ObjectPool } from '@/utils/ObjectPool';
import type { GameEvents } from '@/types';

const createStageSystem = () => {
  const eventBus = new EventBus<GameEvents>();
  const goldManager = new GoldManager(eventBus, 220);
  const gameState = new GameState(eventBus, goldManager);
  const pathSystem = new PathSystem({
    waypoints: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
    towerSlots: [
      { id: 0, x: 0, y: 10 },
      { id: 1, x: 10, y: 10 },
      { id: 2, x: 20, y: 10 },
      { id: 3, x: 30, y: 10 },
      { id: 4, x: 40, y: 10 },
      { id: 5, x: 50, y: 10 },
    ],
    damPosition: { x: 100, y: 0 },
  });
  const spawnSystem = new SpawnSystem(
    new EnemyFactory(),
    pathSystem,
    new ObjectPool(() => new Enemy(enemiesData[0]), (enemy) => enemy.reset()),
  );
  const waveSystem = new WaveSystem(gameState, spawnSystem, eventBus);
  const stageSystem = new StageSystem(
    gameState,
    waveSystem,
    stagesData,
    new ScoreCalculator(),
    enemiesData,
    goldManager,
    eventBus,
  );
  return { eventBus, goldManager, gameState, waveSystem, stageSystem };
};

describe('StageSystem', () => {
  it('awards bonus gold on stage 4 and 9', () => {
    const { goldManager, waveSystem, stageSystem } = createStageSystem();
    stageSystem.start();

    for (let i = 0; i < 9; i += 1) {
      waveSystem.state = 'cleared';
      stageSystem.check();
    }
    expect(goldManager.getBalance()).toBe(420);

    for (let i = 0; i < 15; i += 1) {
      waveSystem.state = 'cleared';
      stageSystem.check();
    }
    expect(goldManager.getBalance()).toBe(820);
  });

  it('emits victory after stage 10 wave 3 clear', () => {
    const { eventBus, gameState, waveSystem, stageSystem } = createStageSystem();
    const victory = vi.fn();
    eventBus.on('victory', victory);
    stageSystem.start();
    gameState.elapsedTime = 1200;

    for (let i = 0; i < 30; i += 1) {
      waveSystem.state = 'cleared';
      stageSystem.check();
    }

    expect(gameState.gameStatus).toBe('victory');
    expect(victory).toHaveBeenCalledTimes(1);
  });
});

