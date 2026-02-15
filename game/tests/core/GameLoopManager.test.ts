import { DamageCalculator } from '@/core/DamageCalculator';
import { EventBus } from '@/core/EventBus';
import { GameLoopManager } from '@/core/GameLoopManager';
import { GameState } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import { mapsData } from '@/data/validatedData';
import { TowerFactory } from '@/entities/TowerFactory';
import { CombatSystem } from '@/systems/CombatSystem';
import { EffectSystem } from '@/systems/EffectSystem';
import { PathSystem } from '@/systems/PathSystem';
import { SoldierSystem } from '@/systems/SoldierSystem';
import { TowerPlacementSystem } from '@/systems/TowerPlacementSystem';
import type { GameEvents } from '@/types';

describe('GameLoopManager', () => {
  it('updates systems in deterministic order', () => {
    const eventBus = new EventBus<GameEvents>();
    const goldManager = new GoldManager(eventBus, 220);
    const gameState = new GameState(eventBus, goldManager);
    const pathSystem = new PathSystem(mapsData.defaultMap);
    const effectSystem = new EffectSystem();
    const combatSystem = new CombatSystem(new DamageCalculator(), effectSystem, eventBus, goldManager);
    const calls: string[] = [];
    const spawnSystem = { update: () => calls.push('spawn') };
    const soldierSystem = { update: () => calls.push('soldier') };
    const waveSystem = { check: () => calls.push('wave') };
    const stageSystem = { check: () => calls.push('stage') };
    const manager = new GameLoopManager(
      gameState,
      pathSystem,
      combatSystem,
      effectSystem,
      spawnSystem,
      waveSystem,
      stageSystem,
      soldierSystem,
    );

    const combatSpy = vi.spyOn(combatSystem, 'update').mockImplementation(() => {
      calls.push('combat');
    });
    const effectSpy = vi.spyOn(effectSystem, 'update').mockImplementation(() => {
      calls.push('effect');
    });

    manager.update(1);
    expect(calls).toEqual(['spawn', 'soldier', 'combat', 'effect', 'wave', 'stage']);
    expect(gameState.elapsedTime).toBe(1);
    combatSpy.mockRestore();
    effectSpy.mockRestore();
  });

  it('does not advance time while paused', () => {
    const eventBus = new EventBus<GameEvents>();
    const goldManager = new GoldManager(eventBus, 220);
    const gameState = new GameState(eventBus, goldManager);
    gameState.setStatus('paused');
    const pathSystem = new PathSystem(mapsData.defaultMap);
    const effectSystem = new EffectSystem();
    const combatSystem = new CombatSystem(new DamageCalculator(), effectSystem, eventBus, goldManager);
    const manager = new GameLoopManager(gameState, pathSystem, combatSystem, effectSystem);

    manager.update(1);
    expect(gameState.elapsedTime).toBe(0);
  });

  it('runs real soldier system in loop', () => {
    const eventBus = new EventBus<GameEvents>();
    const goldManager = new GoldManager(eventBus, 1000);
    const gameState = new GameState(eventBus, goldManager);
    const pathSystem = new PathSystem(mapsData.defaultMap);
    const towerFactory = new TowerFactory();
    const placement = new TowerPlacementSystem(
      gameState,
      goldManager,
      towerFactory,
      pathSystem,
      eventBus,
    );
    placement.placeTower(0, 'warrior');
    const soldierSystem = new SoldierSystem(gameState);
    const effectSystem = new EffectSystem();
    const combatSystem = new CombatSystem(new DamageCalculator(), effectSystem, eventBus, goldManager);
    const manager = new GameLoopManager(gameState, pathSystem, combatSystem, effectSystem, undefined, undefined, undefined, soldierSystem);

    manager.update(0.1);
    expect(soldierSystem.getSquad(0)).toBeDefined();
  });
});
