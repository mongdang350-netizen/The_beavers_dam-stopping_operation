import { enemiesData, mapsData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { TowerFactory } from '@/entities/TowerFactory';
import { PathSystem } from '@/systems/PathSystem';

describe('Tower + TowerFactory', () => {
  const pathSystem = new PathSystem(mapsData.defaultMap);
  const factory = new TowerFactory();

  it('creates all base towers and upgrades with expected stats', () => {
    const base = ['archer', 'warrior', 'mage', 'bomb'] as const;
    for (const type of base) {
      const tower = factory.createTower(type, 0, pathSystem);
      expect(tower.config.id).toBe(type);
    }

    const archer = factory.createTower('archer', 1, pathSystem);
    expect(factory.upgradeTower(archer, 'blowgunner').config.id).toBe('blowgunner');
    const archer2 = factory.createTower('archer', 2, pathSystem);
    expect(factory.upgradeTower(archer2, 'crossbowman').config.id).toBe('crossbowman');

    const warrior = factory.createTower('warrior', 3, pathSystem);
    expect(factory.upgradeTower(warrior, 'knight').config.id).toBe('knight');
    const warrior2 = factory.createTower('warrior', 4, pathSystem);
    expect(factory.upgradeTower(warrior2, 'suit').config.id).toBe('suit');

    const mage = factory.createTower('mage', 5, pathSystem);
    expect(factory.upgradeTower(mage, 'fireMage').config.id).toBe('fireMage');

    const bomb = factory.createTower('bomb', 0, pathSystem);
    expect(factory.upgradeTower(bomb, 'mortar').config.id).toBe('mortar');
  });

  it('selects first target by highest progress in range', () => {
    const tower = factory.createTower('archer', 0, pathSystem);
    const piranha = new Enemy(enemiesData.find((enemy) => enemy.id === 'piranha')!);
    const catfish = new Enemy(enemiesData.find((enemy) => enemy.id === 'catfish')!);
    piranha.position = { x: tower.position.x + 10, y: tower.position.y + 10 };
    catfish.position = { x: tower.position.x + 20, y: tower.position.y + 10 };
    piranha.progress = 0.5;
    catfish.progress = 0.8;

    const target = tower.findTarget([piranha, catfish]);
    expect(target).toBe(catfish);
  });

  it('ignores out of range enemies', () => {
    const tower = factory.createTower('archer', 0, pathSystem);
    const enemy = new Enemy(enemiesData[0]);
    enemy.position = { x: tower.position.x + 1000, y: tower.position.y };
    enemy.progress = 0.9;
    expect(tower.findTarget([enemy])).toBeNull();
  });

  it('respects attack cooldown from attack speed', () => {
    const tower = factory.createTower('archer', 0, pathSystem);
    expect(tower.canAttack(0)).toBe(true);
    tower.recordAttack(0);
    expect(tower.canAttack(0.49)).toBe(false);
    expect(tower.canAttack(0.5)).toBe(true);
  });

  it('selects aoe targets by radius and maxTargets', () => {
    const tower = factory.createTower('mage', 0, pathSystem);
    const primary = new Enemy(enemiesData[0]);
    primary.position = { x: 500, y: 500 };
    primary.progress = 0.9;
    const near = Array.from({ length: 12 }).map((_, index) => {
      const enemy = new Enemy(enemiesData[0]);
      enemy.position = { x: 500 + index, y: 500 };
      enemy.progress = 0.8 - index * 0.01;
      return enemy;
    });

    const targets = tower.findAoeTargets([primary, ...near], primary);
    expect(targets.length).toBeLessThanOrEqual(tower.config.maxTargets ?? 0);
    expect(targets).toContain(primary);
  });

  it('finds cone targets for fire mage', () => {
    const tower = factory.createTower('mage', 0, pathSystem);
    factory.upgradeTower(tower, 'fireMage');
    const inCone = new Enemy(enemiesData[0]);
    inCone.position = { x: tower.position.x + 100, y: tower.position.y };
    const outCone = new Enemy(enemiesData[0]);
    outCone.position = { x: tower.position.x, y: tower.position.y + 100 };

    const targets = tower.findConeTargets([inCone, outCone], { x: 1, y: 0 });
    expect(targets).toContain(inCone);
    expect(targets).not.toContain(outCone);
  });

  it('supports line-targeting tower and mortar long range', () => {
    const logTower = factory.createTower('bomb', 0, pathSystem);
    factory.upgradeTower(logTower, 'logRoller');
    const enemy = new Enemy(enemiesData[0]);
    enemy.position = pathSystem.getPositionAtProgress(0.5);
    const targets = logTower.findLineTargets([enemy], pathSystem);
    expect(targets).toContain(enemy);

    const mortar = factory.createTower('bomb', 1, pathSystem);
    factory.upgradeTower(mortar, 'mortar');
    expect(mortar.config.range).toBe(7);
    expect(mortar.config.aoeRadius).toBe(2);
  });

  it('applies anaconda attack speed debuff', () => {
    const tower = factory.createTower('archer', 0, pathSystem);
    expect(tower.getEffectiveAttackSpeed()).toBe(2);
    tower.setAttackSpeedDebuff(0.3);
    expect(tower.getEffectiveAttackSpeed()).toBe(1.7);
  });
});

