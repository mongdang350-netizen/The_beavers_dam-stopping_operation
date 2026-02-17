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

  it('advances waves within a stage using dynamic waves.length', () => {
    const { gameState, waveSystem, stageSystem } = createStageSystem();
    stageSystem.start();
    expect(gameState.currentStage).toBe(1);
    expect(gameState.currentWave).toBe(1);

    waveSystem.state = 'cleared';
    stageSystem.check();
    expect(gameState.currentWave).toBe(2);
    expect(gameState.currentStage).toBe(1);

    waveSystem.state = 'cleared';
    stageSystem.check();
    expect(gameState.currentWave).toBe(3);
    expect(gameState.currentStage).toBe(1);
  });

  it('advances from stage 1 to stage 2 after all waves clear', () => {
    const { gameState, waveSystem, stageSystem } = createStageSystem();
    const stage1Waves = stagesData[0].waves.length;
    stageSystem.start();

    for (let i = 0; i < stage1Waves; i += 1) {
      waveSystem.state = 'cleared';
      stageSystem.check();
    }

    expect(gameState.currentStage).toBe(2);
    expect(gameState.currentWave).toBe(1);
  });

  it('emits stageStart and stageEnd events', () => {
    const { eventBus, waveSystem, stageSystem } = createStageSystem();
    const stageStart = vi.fn();
    const stageEnd = vi.fn();
    eventBus.on('stageStart', stageStart);
    eventBus.on('stageEnd', stageEnd);

    stageSystem.start();
    expect(stageStart).toHaveBeenCalledWith({ stageId: 1 });

    const stage1Waves = stagesData[0].waves.length;
    for (let i = 0; i < stage1Waves; i += 1) {
      waveSystem.state = 'cleared';
      stageSystem.check();
    }

    expect(stageEnd).toHaveBeenCalledWith({ stageId: 1 });
    expect(stageStart).toHaveBeenCalledWith({ stageId: 2 });
  });

  it('does not proceed when wave is not cleared', () => {
    const { gameState, waveSystem, stageSystem } = createStageSystem();
    stageSystem.start();

    waveSystem.state = 'spawning';
    stageSystem.check();
    expect(gameState.currentWave).toBe(1);
    expect(gameState.currentStage).toBe(1);
  });

  it('does not proceed when gameStatus is gameOver', () => {
    const { gameState, waveSystem, stageSystem } = createStageSystem();
    stageSystem.start();
    gameState.gameStatus = 'gameOver';

    waveSystem.state = 'cleared';
    stageSystem.check();
    expect(gameState.currentWave).toBe(1);
    expect(gameState.currentStage).toBe(1);
  });

  it('does not start twice', () => {
    const { gameState, stageSystem } = createStageSystem();

    stageSystem.start();
    stageSystem.start();
    expect(gameState.currentStage).toBe(1);
  });

  it('check does nothing before start is called', () => {
    const { gameState, waveSystem, stageSystem } = createStageSystem();
    waveSystem.state = 'cleared';
    stageSystem.check();
    expect(gameState.currentWave).toBe(1);
  });

  it('startCurrentWave delegates to waveSystem', () => {
    const { waveSystem, stageSystem } = createStageSystem();
    stageSystem.start();

    const result = stageSystem.startCurrentWave();
    expect(result).toBe(true);
    expect(waveSystem.state).toBe('spawning');
  });

  it('startCurrentWave returns false when wave already active', () => {
    const { stageSystem } = createStageSystem();
    stageSystem.start();

    stageSystem.startCurrentWave();
    const result = stageSystem.startCurrentWave();
    expect(result).toBe(false);
  });

  it('uses stage.waves.length - 1 dynamically for wave advancement', () => {
    const { gameState, waveSystem, stageSystem } = createStageSystem();
    stageSystem.start();

    const stage1 = stageSystem.getCurrentStage();
    expect(stage1.waves.length).toBe(3);

    waveSystem.state = 'cleared';
    stageSystem.check();
    waveSystem.state = 'cleared';
    stageSystem.check();
    expect(gameState.currentStage).toBe(1);
    expect(gameState.currentWave).toBe(3);

    waveSystem.state = 'cleared';
    stageSystem.check();
    expect(gameState.currentStage).toBe(2);
  });

  it('victory event includes score and stars', () => {
    const { eventBus, gameState, waveSystem, stageSystem } = createStageSystem();
    const victory = vi.fn();
    eventBus.on('victory', victory);
    stageSystem.start();
    gameState.elapsedTime = 600;

    for (let i = 0; i < 30; i += 1) {
      waveSystem.state = 'cleared';
      stageSystem.check();
    }

    expect(victory).toHaveBeenCalledTimes(1);
    const payload = victory.mock.calls[0][0];
    expect(payload).toHaveProperty('score');
    expect(payload).toHaveProperty('stars');
    expect(typeof payload.score).toBe('number');
    expect(typeof payload.stars).toBe('number');
  });

  it('resets waveSystem when entering a new stage', () => {
    const { waveSystem, stageSystem } = createStageSystem();
    stageSystem.start();

    const stage1Waves = stagesData[0].waves.length;
    for (let i = 0; i < stage1Waves; i += 1) {
      waveSystem.state = 'cleared';
      stageSystem.check();
    }

    expect(waveSystem.state).toBe('preparing');
  });

  it('sets gameState status to preparing when entering a new stage', () => {
    const { gameState, waveSystem, stageSystem } = createStageSystem();
    stageSystem.start();

    const stage1Waves = stagesData[0].waves.length;
    for (let i = 0; i < stage1Waves; i += 1) {
      waveSystem.state = 'cleared';
      stageSystem.check();
    }

    expect(gameState.gameStatus).toBe('preparing');
  });

  it('accepts optional stageId parameter to start at specific stage', () => {
    const { gameState, stageSystem } = createStageSystem();

    stageSystem.start(3);
    expect(gameState.currentStage).toBe(3);
    expect(gameState.currentWave).toBe(1);
  });

  it('throws error for invalid stageId (too low)', () => {
    const { stageSystem } = createStageSystem();

    expect(() => stageSystem.start(0)).toThrow('Invalid stageId: 0');
  });

  it('throws error for invalid stageId (too high)', () => {
    const { stageSystem } = createStageSystem();

    expect(() => stageSystem.start(11)).toThrow('Invalid stageId: 11');
  });

  it('starts countdown when wave is cleared and more waves remain', () => {
    const { waveSystem, stageSystem } = createStageSystem();
    stageSystem.start();

    waveSystem.state = 'cleared';
    stageSystem.check();

    expect(waveSystem.state).toBe('countdown');
    expect(waveSystem.getCountdown()).toBe(3.0);
  });

  it('does not start countdown when last wave of stage is cleared', () => {
    const { waveSystem, stageSystem } = createStageSystem();
    stageSystem.start();

    const stage1Waves = stagesData[0].waves.length;
    for (let i = 0; i < stage1Waves; i += 1) {
      waveSystem.state = 'cleared';
      stageSystem.check();
    }

    expect(waveSystem.state).toBe('preparing');
  });
});
