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
import { ObjectPool } from '@/utils/ObjectPool';

const createContext = () => {
  const eventBus = new EventBus<GameEvents>();
  const goldManager = new GoldManager(eventBus, 500);
  const gameState = new GameState(eventBus, goldManager);
  const pathSystem = new PathSystem(mapsData.defaultMap);
  const damageCalculator = new DamageCalculator();
  const effectSystem = new EffectSystem();
  const combatSystem = new CombatSystem(damageCalculator, effectSystem, eventBus, goldManager);
  const towerFactory = new TowerFactory();
  const placement = new TowerPlacementSystem(
    gameState,
    goldManager,
    towerFactory,
    pathSystem,
    eventBus,
  );
  const upgrade = new UpgradeSystem(gameState, goldManager, towerFactory, eventBus);

  return { eventBus, goldManager, gameState, pathSystem, combatSystem, placement, upgrade };
};

describe('CombatSystem', () => {
  it('tower kills enemy and grants gold', () => {
    const { gameState, pathSystem, combatSystem, placement, goldManager } = createContext();
    placement.placeTower(0, 'archer');
    const enemy = new Enemy(enemiesData[0]);
    enemy.position = { ...gameState.towers.get(0)!.position };
    gameState.enemies = [enemy];

    combatSystem.update(1, gameState, pathSystem);
    combatSystem.update(0.5, gameState, pathSystem);
    expect(gameState.enemies).toHaveLength(0);
    expect(goldManager.getBalance()).toBeGreaterThan(500 - 100);
  });

  it('aoe tower damages multiple enemies', () => {
    const { gameState, pathSystem, combatSystem, placement } = createContext();
    placement.placeTower(0, 'mage');
    const basePos = gameState.towers.get(0)!.position;
    const e1 = new Enemy(enemiesData[0]);
    const e2 = new Enemy(enemiesData[0]);
    e1.position = { x: basePos.x + 10, y: basePos.y };
    e2.position = { x: basePos.x + 20, y: basePos.y };
    gameState.enemies = [e1, e2];

    combatSystem.update(1, gameState, pathSystem);
    expect(e1.hp).toBeLessThan(e1.maxHp);
    expect(e2.hp).toBeLessThan(e2.maxHp);
  });

  it('applies aoe status effects to all targets', () => {
    const { gameState, pathSystem, combatSystem, placement, upgrade, goldManager } = createContext();
    placement.placeTower(0, 'mage');
    goldManager.earn(300);
    upgrade.upgradeTower(0, 'iceMage');
    const basePos = gameState.towers.get(0)!.position;
    const e1 = new Enemy(enemiesData[0]);
    const e2 = new Enemy(enemiesData[0]);
    e1.position = { x: basePos.x + 10, y: basePos.y };
    e2.position = { x: basePos.x + 20, y: basePos.y };
    gameState.enemies = [e1, e2];

    for (let i = 0; i < 10; i += 1) {
      combatSystem.update(0.1, gameState, pathSystem);
    }
    expect(e1.effects.some((effect) => effect.type === 'slow')).toBe(true);
    expect(e2.effects.some((effect) => effect.type === 'slow')).toBe(true);
  });

  it('fire mage deals continuous cone damage', () => {
    const { gameState, pathSystem, combatSystem, placement, upgrade, goldManager } = createContext();
    placement.placeTower(0, 'mage');
    goldManager.earn(200);
    upgrade.upgradeTower(0, 'fireMage');
    const tower = gameState.towers.get(0)!;

    const inCone = new Enemy(enemiesData[0]);
    inCone.position = { x: tower.position.x + 50, y: tower.position.y };
    const outCone = new Enemy(enemiesData[0]);
    outCone.position = { x: tower.position.x, y: tower.position.y + 80 };
    gameState.enemies = [inCone, outCone];

    combatSystem.update(1, gameState, pathSystem);
    expect(inCone.hp).toBeLessThan(inCone.maxHp);
    expect(outCone.hp).toBe(outCone.maxHp);
    expect(inCone.effects.some((effect) => effect.type === 'burn')).toBe(true);
  });

  it('log roller hits enemies along path line', () => {
    const { gameState, pathSystem, combatSystem, placement, upgrade, goldManager } = createContext();
    placement.placeTower(0, 'bomb');
    goldManager.earn(200);
    upgrade.upgradeTower(0, 'logRoller');
    const onPathEnemy = new Enemy(enemiesData[0]);
    onPathEnemy.position = pathSystem.getPositionAtProgress(0.5);
    gameState.enemies = [onPathEnemy];

    combatSystem.update(3, gameState, pathSystem);
    expect(onPathEnemy.hp).toBeLessThan(onPathEnemy.maxHp);
  });

  it('applies anaconda aura and restores when out of range', () => {
    const { gameState, pathSystem, combatSystem, placement } = createContext();
    placement.placeTower(0, 'archer');
    const tower = gameState.towers.get(0)!;
    const anaconda = new Enemy(enemiesData.find((entry) => entry.id === 'anaconda')!);
    anaconda.position = { ...tower.position };
    gameState.enemies = [anaconda];

    combatSystem.update(0.1, gameState, pathSystem);
    expect(tower.getEffectiveAttackSpeed()).toBeCloseTo(tower.config.attackSpeed - 0.3, 5);
    anaconda.position = { x: tower.position.x + 1000, y: tower.position.y + 1000 };
    combatSystem.update(0.1, gameState, pathSystem);
    expect(tower.getEffectiveAttackSpeed()).toBeCloseTo(tower.config.attackSpeed, 5);
  });

  it('damages dam when enemy is attackingDam', () => {
    const { gameState, pathSystem, combatSystem } = createContext();
    const enemy = new Enemy(enemiesData[0]);
    enemy.status = 'attackingDam';
    gameState.enemies = [enemy];

    combatSystem.update(1, gameState, pathSystem);
    expect(gameState.damHp).toBeLessThan(gameState.damMaxHp);
  });

  it('creates and resolves projectiles', () => {
    const { gameState, pathSystem, combatSystem, placement } = createContext();
    placement.placeTower(0, 'archer');
    const tower = gameState.towers.get(0)!;
    const enemy = new Enemy(enemiesData[0]);
    enemy.position = { x: tower.position.x + 200, y: tower.position.y };
    gameState.enemies = [enemy];

    combatSystem.update(0.1, gameState, pathSystem);
    expect(gameState.projectiles.length).toBeGreaterThan(0);

    for (let i = 0; i < 30; i += 1) {
      combatSystem.update(0.1, gameState, pathSystem);
    }
    expect(gameState.projectiles).toHaveLength(0);
  });

  it('releases dead enemies to pool when provided', () => {
    const eventBus = new EventBus<GameEvents>();
    const goldManager = new GoldManager(eventBus, 500);
    const gameState = new GameState(eventBus, goldManager);
    const pathSystem = new PathSystem(mapsData.defaultMap);
    const effectSystem = new EffectSystem();
    const enemyPool = new ObjectPool(() => new Enemy(enemiesData[0]), (enemy) => enemy.reset());
    const releaseSpy = vi.spyOn(enemyPool, 'release');
    const combatSystem = new CombatSystem(
      new DamageCalculator(),
      effectSystem,
      eventBus,
      goldManager,
      enemyPool,
    );
    const towerFactory = new TowerFactory();
    const placement = new TowerPlacementSystem(
      gameState,
      goldManager,
      towerFactory,
      pathSystem,
      eventBus,
    );

    placement.placeTower(0, 'archer');
    const enemy = new Enemy(enemiesData[0]);
    enemy.position = { ...gameState.towers.get(0)!.position };
    gameState.enemies = [enemy];

    for (let i = 0; i < 20; i += 1) {
      combatSystem.update(0.1, gameState, pathSystem);
    }
    expect(releaseSpy).toHaveBeenCalled();
  });
});
