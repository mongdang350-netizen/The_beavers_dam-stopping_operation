import { EventBus } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import { mapsData } from '@/data/validatedData';
import { TowerFactory } from '@/entities/TowerFactory';
import { PathSystem } from '@/systems/PathSystem';
import { TowerPlacementSystem } from '@/systems/TowerPlacementSystem';
import { UpgradeSystem } from '@/systems/UpgradeSystem';
import type { GameEvents } from '@/types';

describe('economy integration', () => {
  it('handles placement -> earn -> upgrade -> sell flow', () => {
    const eventBus = new EventBus<GameEvents>();
    const goldManager = new GoldManager(eventBus, 220);
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
    const upgrade = new UpgradeSystem(gameState, goldManager, towerFactory, eventBus);

    expect(placement.placeTower(0, 'archer')).toBe(true);
    goldManager.earn(200);
    expect(upgrade.upgradeTower(0, 'crossbowman')).toBe(true);
    const refund = placement.sellTower(0);

    expect(refund).toBe(125);
    expect(goldManager.getBalance()).toBe(295);
  });
});
