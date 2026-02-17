import { EventBus } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import { mapsData } from '@/data/validatedData';
import { TowerFactory } from '@/entities/TowerFactory';
import { PathSystem } from '@/systems/PathSystem';
import { TowerPlacementSystem } from '@/systems/TowerPlacementSystem';
import { UpgradeSystem } from '@/systems/UpgradeSystem';
import type { GameEvents } from '@/types';

const createContext = () => {
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
  return { eventBus, goldManager, gameState, placement, upgrade };
};

describe('UpgradeSystem', () => {
  it('upgrades tower and consumes gold', () => {
    const { goldManager, gameState, placement, upgrade } = createContext();
    placement.placeTower(0, 'agile');
    goldManager.earn(200);

    expect(upgrade.upgradeTower(0, 'archer')).toBe(true);
    expect(gameState.towers.get(0)?.config.id).toBe('archer');
    expect(goldManager.getBalance()).toBe(320 - 150);
  });

  it('does not allow second upgrade on already upgraded tower', () => {
    const { goldManager, placement, upgrade } = createContext();
    placement.placeTower(0, 'agile');
    goldManager.earn(200);
    upgrade.upgradeTower(0, 'blowgunner');
    expect(upgrade.upgradeTower(0, 'archer')).toBe(false);
  });

  it('returns no upgrades for empty or upgraded slots', () => {
    const { goldManager, placement, upgrade } = createContext();
    expect(upgrade.getAvailableUpgrades(0)).toEqual([]);
    placement.placeTower(0, 'agile');
    expect(upgrade.getAvailableUpgrades(0)).toEqual(['archer', 'blowgunner']);
    goldManager.earn(200);
    upgrade.upgradeTower(0, 'blowgunner');
    expect(upgrade.getAvailableUpgrades(0)).toEqual([]);
  });

  it('refunds base+upgrade cost on sale', () => {
    const { goldManager, placement, upgrade } = createContext();
    placement.placeTower(0, 'agile');
    goldManager.earn(200);
    upgrade.upgradeTower(0, 'blowgunner');
    const refund = placement.sellTower(0);

    expect(refund).toBe(Math.floor((100 + 160) * 0.5));
    expect(goldManager.getBalance()).toBe(160 + refund);
  });
});
