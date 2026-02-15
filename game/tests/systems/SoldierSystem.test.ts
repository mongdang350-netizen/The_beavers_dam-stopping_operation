import { EventBus } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import { enemiesData, mapsData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { TowerFactory } from '@/entities/TowerFactory';
import { PathSystem } from '@/systems/PathSystem';
import { SoldierSystem } from '@/systems/SoldierSystem';
import { TowerPlacementSystem } from '@/systems/TowerPlacementSystem';
import { UpgradeSystem } from '@/systems/UpgradeSystem';
import type { GameEvents } from '@/types';

describe('SoldierSystem', () => {
  it('creates squads for warrior-family towers and blocks enemies', () => {
    const eventBus = new EventBus<GameEvents>();
    const goldManager = new GoldManager(eventBus, 1000);
    const gameState = new GameState(eventBus, goldManager);
    const pathSystem = new PathSystem(mapsData.defaultMap);
    const factory = new TowerFactory();
    const placement = new TowerPlacementSystem(gameState, goldManager, factory, pathSystem, eventBus);
    const soldiers = new SoldierSystem(gameState);

    placement.placeTower(0, 'warrior');
    soldiers.update(1);
    expect(soldiers.getSquad(0)).toBeDefined();

    const enemy = new Enemy(enemiesData[0]);
    enemy.position = { ...gameState.towers.get(0)!.position };
    gameState.enemies = [enemy];

    soldiers.update(0.2);
    expect(enemy.status).toBe('blocked');
  });

  it('switches squad profile when upgraded to suit', () => {
    const eventBus = new EventBus<GameEvents>();
    const goldManager = new GoldManager(eventBus, 1000);
    const gameState = new GameState(eventBus, goldManager);
    const pathSystem = new PathSystem(mapsData.defaultMap);
    const factory = new TowerFactory();
    const placement = new TowerPlacementSystem(gameState, goldManager, factory, pathSystem, eventBus);
    const upgrade = new UpgradeSystem(gameState, goldManager, factory, eventBus);
    const soldiers = new SoldierSystem(gameState);

    placement.placeTower(0, 'warrior');
    upgrade.upgradeTower(0, 'suit');
    soldiers.update(0.1);
    expect(soldiers.getSquad(0)?.getSoldiers()).toHaveLength(1);
  });
});

