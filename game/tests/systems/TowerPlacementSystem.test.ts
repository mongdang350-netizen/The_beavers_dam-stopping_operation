import { EventBus } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import { mapsData } from '@/data/validatedData';
import { TowerFactory } from '@/entities/TowerFactory';
import { PathSystem } from '@/systems/PathSystem';
import { TowerPlacementSystem } from '@/systems/TowerPlacementSystem';
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
  return { eventBus, goldManager, gameState, placement };
};

describe('TowerPlacementSystem', () => {
  it('places tower on empty slot and emits event', () => {
    const { eventBus, goldManager, gameState, placement } = createContext();
    const listener = vi.fn();
    eventBus.on('towerPlaced', listener);

    expect(placement.placeTower(0, 'agile')).toBe(true);
    expect(gameState.towers.has(0)).toBe(true);
    expect(goldManager.getBalance()).toBe(120);
    expect(listener).toHaveBeenCalledWith({ slotIndex: 0, towerType: 'agile' });
  });

  it('fails if slot is already occupied', () => {
    const { placement } = createContext();
    expect(placement.placeTower(0, 'agile')).toBe(true);
    expect(placement.placeTower(0, 'smart')).toBe(false);
  });

  it('fails when gold is insufficient', () => {
    const { goldManager, placement } = createContext();
    goldManager.spend(200);
    expect(placement.placeTower(0, 'capable')).toBe(false);
  });

  it('sells tower with 50% refund and emits event', () => {
    const { eventBus, goldManager, gameState, placement } = createContext();
    const sold = vi.fn();
    eventBus.on('towerSold', sold);
    placement.placeTower(0, 'agile');

    const refund = placement.sellTower(0);
    expect(refund).toBe(50);
    expect(goldManager.getBalance()).toBe(170);
    expect(gameState.towers.has(0)).toBe(false);
    expect(sold).toHaveBeenCalledWith({ slotIndex: 0, goldRefunded: 50 });
  });

  it('returns affordable towers for current balance', () => {
    const { goldManager, placement } = createContext();
    goldManager.spend(90);
    const affordable = placement.getAffordableTowers();
    expect(affordable).toContain('agile');
    expect(affordable).not.toContain('smart');
  });
});
