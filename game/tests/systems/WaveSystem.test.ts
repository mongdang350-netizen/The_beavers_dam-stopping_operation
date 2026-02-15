import { EventBus } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import { enemiesData, mapsData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { EnemyFactory } from '@/entities/EnemyFactory';
import { PathSystem } from '@/systems/PathSystem';
import { SpawnSystem } from '@/systems/SpawnSystem';
import { WaveSystem } from '@/systems/WaveSystem';
import { ObjectPool } from '@/utils/ObjectPool';
import type { GameEvents } from '@/types';

const createWaveContext = () => {
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
  return { eventBus, gameState, spawnSystem, waveSystem };
};

describe('WaveSystem', () => {
  it('transitions preparing -> spawning -> inProgress -> cleared', () => {
    const { gameState, waveSystem } = createWaveContext();

    const started = waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    expect(started).toBe(true);
    expect(waveSystem.state).toBe('spawning');

    waveSystem.update(1, 1, 1);
    expect(waveSystem.state).toBe('inProgress');
    gameState.enemies = [];
    waveSystem.update(0, 1, 1);
    expect(waveSystem.state).toBe('cleared');
  });

  it('rejects startNextWave when state is spawning', () => {
    const { waveSystem } = createWaveContext();

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    expect(waveSystem.state).toBe('spawning');

    const result = waveSystem.startNextWave(1, 2, { enemies: [{ type: 'piranha', count: 1 }] });
    expect(result).toBe(false);
  });

  it('rejects startNextWave when state is inProgress', () => {
    const { waveSystem } = createWaveContext();

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    waveSystem.update(1, 1, 1);
    expect(waveSystem.state).toBe('inProgress');

    const result = waveSystem.startNextWave(1, 2, { enemies: [{ type: 'piranha', count: 1 }] });
    expect(result).toBe(false);
  });

  it('allows startNextWave from cleared state', () => {
    const { gameState, waveSystem } = createWaveContext();

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    waveSystem.update(1, 1, 1);
    gameState.enemies = [];
    waveSystem.update(0, 1, 1);
    expect(waveSystem.state).toBe('cleared');

    const result = waveSystem.startNextWave(1, 2, { enemies: [{ type: 'piranha', count: 1 }] });
    expect(result).toBe(true);
    expect(waveSystem.state).toBe('spawning');
  });

  it('update returns spawned enemies during spawning state', () => {
    const { waveSystem } = createWaveContext();

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 2 }] });
    const spawned = waveSystem.update(1, 1, 1);
    expect(spawned.length).toBeGreaterThan(0);
  });

  it('update returns empty array in inProgress state', () => {
    const { waveSystem } = createWaveContext();

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    waveSystem.update(1, 1, 1);
    expect(waveSystem.state).toBe('inProgress');

    const result = waveSystem.update(0.1, 1, 1);
    expect(result).toEqual([]);
  });

  it('update returns empty array in preparing state', () => {
    const { waveSystem } = createWaveContext();
    expect(waveSystem.state).toBe('preparing');
    const result = waveSystem.update(0.1, 1, 1);
    expect(result).toEqual([]);
  });

  it('detects wave completion when all enemies removed', () => {
    const { gameState, waveSystem } = createWaveContext();

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 3 }] });
    waveSystem.update(5, 1, 1);
    expect(waveSystem.state).toBe('inProgress');

    gameState.enemies = [];
    waveSystem.update(0, 1, 1);
    expect(waveSystem.state).toBe('cleared');
  });

  it('emits waveStart event on startNextWave', () => {
    const { eventBus, waveSystem } = createWaveContext();
    const handler = vi.fn();
    eventBus.on('waveStart', handler);

    waveSystem.startNextWave(2, 3, { enemies: [{ type: 'piranha', count: 1 }] });
    expect(handler).toHaveBeenCalledWith({ stageId: 2, waveIndex: 3 });
  });

  it('emits waveEnd event when wave is cleared', () => {
    const { eventBus, gameState, waveSystem } = createWaveContext();
    const handler = vi.fn();
    eventBus.on('waveEnd', handler);

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    waveSystem.update(1, 1, 1);
    gameState.enemies = [];
    waveSystem.update(0, 1, 1);

    expect(handler).toHaveBeenCalledWith({ stageId: 1, waveIndex: 1 });
  });

  it('sets gameState status to playing on startNextWave', () => {
    const { gameState, waveSystem } = createWaveContext();
    expect(gameState.gameStatus).toBe('menu');

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    expect(gameState.gameStatus).toBe('playing');
  });

  it('sets gameState status to preparing when wave clears', () => {
    const { gameState, waveSystem } = createWaveContext();

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    waveSystem.update(1, 1, 1);
    gameState.enemies = [];
    waveSystem.update(0, 1, 1);

    expect(gameState.gameStatus).toBe('preparing');
  });

  it('does not transition to cleared while enemies remain', () => {
    const { gameState, waveSystem } = createWaveContext();

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    waveSystem.update(1, 1, 1);
    expect(waveSystem.state).toBe('inProgress');
    expect(gameState.enemies.length).toBeGreaterThan(0);

    waveSystem.update(0, 1, 1);
    expect(waveSystem.state).toBe('inProgress');
  });

  it('reset returns state to preparing', () => {
    const { gameState, waveSystem } = createWaveContext();

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    waveSystem.update(1, 1, 1);
    gameState.enemies = [];
    waveSystem.update(0, 1, 1);
    expect(waveSystem.state).toBe('cleared');

    waveSystem.reset();
    expect(waveSystem.state).toBe('preparing');
  });

  it('check() delegates to update with zero dt', () => {
    const { gameState, waveSystem } = createWaveContext();

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    waveSystem.update(1, 1, 1);
    gameState.enemies = [];

    waveSystem.check(1, 1);
    expect(waveSystem.state).toBe('cleared');
  });

  it('handles empty wave config (no enemies)', () => {
    const { waveSystem } = createWaveContext();

    const started = waveSystem.startNextWave(1, 1, { enemies: [] });
    expect(started).toBe(true);
    expect(waveSystem.state).toBe('spawning');

    waveSystem.update(0.1, 1, 1);
    expect(waveSystem.state).toBe('inProgress');
  });

  it('pushes spawned enemies into gameState.enemies', () => {
    const { gameState, waveSystem } = createWaveContext();
    expect(gameState.enemies).toHaveLength(0);

    waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 2 }] });
    waveSystem.update(1, 1, 1);

    expect(gameState.enemies.length).toBeGreaterThan(0);
  });
});
