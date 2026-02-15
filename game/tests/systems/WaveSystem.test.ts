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

describe('WaveSystem', () => {
  it('transitions preparing -> spawning -> inProgress -> cleared', () => {
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

    const started = waveSystem.startNextWave(1, 1, { enemies: [{ type: 'piranha', count: 1 }] });
    expect(started).toBe(true);
    expect(waveSystem.state).toBe('spawning');

    waveSystem.update(1, 1, 1);
    expect(waveSystem.state).toBe('inProgress');
    gameState.enemies = [];
    waveSystem.update(0, 1, 1);
    expect(waveSystem.state).toBe('cleared');
  });
});

