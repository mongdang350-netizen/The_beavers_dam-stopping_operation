import { EventBus } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import { ScoreCalculator } from '@/core/ScoreCalculator';
import { enemiesData, mapsData, stagesData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { EnemyFactory } from '@/entities/EnemyFactory';
import { PathSystem } from '@/systems/PathSystem';
import { SpawnSystem } from '@/systems/SpawnSystem';
import { StageSystem } from '@/systems/StageSystem';
import { WaveSystem } from '@/systems/WaveSystem';
import { ObjectPool } from '@/utils/ObjectPool';
import type { GameEvents } from '@/types';

describe('game flow integration', () => {
  it('simulates full 10-stage progression and supports game over', () => {
    const eventBus = new EventBus<GameEvents>();
    const goldManager = new GoldManager(eventBus, 220);
    const gameState = new GameState(eventBus, goldManager);
    const pathSystem = new PathSystem(mapsData.defaultMap);
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
    stageSystem.start();
    gameState.elapsedTime = 1500;

    for (let i = 0; i < 30; i += 1) {
      waveSystem.state = 'cleared';
      stageSystem.check();
    }

    expect(gameState.gameStatus).toBe('victory');

    gameState.reset();
    gameState.damageDam(9999);
    expect(gameState.gameStatus).toBe('gameOver');
  });
});

