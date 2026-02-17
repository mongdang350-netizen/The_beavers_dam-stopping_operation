import { DamageCalculator } from '@/core/DamageCalculator';
import { EventBus } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import { enemiesData, mapsData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { TowerFactory } from '@/entities/TowerFactory';
import { CombatSystem } from '@/systems/CombatSystem';
import { EffectSystem } from '@/systems/EffectSystem';
import { PathSystem } from '@/systems/PathSystem';
import { TowerPlacementSystem } from '@/systems/TowerPlacementSystem';
import { UpgradeSystem } from '@/systems/UpgradeSystem';
import type { GameEvents } from '@/types';

describe('combat scenarios integration', () => {
  it('handles multiple towers, enemies, and status effects', () => {
    const eventBus = new EventBus<GameEvents>();
    const goldManager = new GoldManager(eventBus, 1000);
    const gameState = new GameState(eventBus, goldManager);
    const pathSystem = new PathSystem(mapsData.defaultMap);
    const factory = new TowerFactory();
    const placement = new TowerPlacementSystem(gameState, goldManager, factory, pathSystem, eventBus);
    const upgrade = new UpgradeSystem(gameState, goldManager, factory, eventBus);
    const combatSystem = new CombatSystem(
      new DamageCalculator(),
      new EffectSystem(),
      eventBus,
      goldManager,
    );

    placement.placeTower(0, 'agile');
    placement.placeTower(1, 'capable');
    upgrade.upgradeTower(0, 'blowgunner');
    upgrade.upgradeTower(1, 'wizard');

    const enemies = ['piranha', 'catfish', 'turtle', 'anaconda'].map((type, index) => {
      const enemy = new Enemy(enemiesData.find((entry) => entry.id === type)!);
      enemy.position = { x: 600 + index * 20, y: 200 + index * 10 };
      enemy.progress = 0.5 + index * 0.05;
      return enemy;
    });
    gameState.enemies = enemies;

    for (let i = 0; i < 10; i += 1) {
      combatSystem.update(0.5, gameState, pathSystem);
    }

    expect(gameState.enemies.length).toBeLessThanOrEqual(4);
    expect(goldManager.getBalance()).toBeGreaterThan(0);
    const hasEffect = enemies.some((enemy) => enemy.effects.length > 0);
    expect(hasEffect).toBe(true);
  });
});

