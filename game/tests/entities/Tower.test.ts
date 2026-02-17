import { enemiesData, mapsData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { TowerFactory } from '@/entities/TowerFactory';
import { PathSystem } from '@/systems/PathSystem';

describe('Tower + TowerFactory', () => {
  const pathSystem = new PathSystem(mapsData.defaultMap);
  const factory = new TowerFactory();

  it('creates all base towers and upgrades with expected stats', () => {
    const base = ['agile', 'brave', 'capable', 'smart'] as const;
    for (const type of base) {
      const tower = factory.createTower(type, 0, pathSystem);
      expect(tower.config.id).toBe(type);
    }

    const agile = factory.createTower('agile', 1, pathSystem);
    expect(factory.upgradeTower(agile, 'blowgunner').config.id).toBe('blowgunner');
    const agile2 = factory.createTower('agile', 2, pathSystem);
    expect(factory.upgradeTower(agile2, 'archer').config.id).toBe('archer');

    const brave = factory.createTower('brave', 3, pathSystem);
    expect(factory.upgradeTower(brave, 'knight').config.id).toBe('knight');

    const capable = factory.createTower('capable', 5, pathSystem);
    expect(factory.upgradeTower(capable, 'dragonTamer').config.id).toBe('dragonTamer');

    const smart = factory.createTower('smart', 0, pathSystem);
    expect(factory.upgradeTower(smart, 'waterBomber').config.id).toBe('waterBomber');
  });

  it('selects first target by highest progress in range', () => {
    const tower = factory.createTower('agile', 0, pathSystem);
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
    const tower = factory.createTower('agile', 0, pathSystem);
    const enemy = new Enemy(enemiesData[0]);
    enemy.position = { x: tower.position.x + 1000, y: tower.position.y };
    enemy.progress = 0.9;
    expect(tower.findTarget([enemy])).toBeNull();
  });

  it('respects attack cooldown from attack speed', () => {
    const tower = factory.createTower('agile', 0, pathSystem);
    expect(tower.canAttack(0)).toBe(true);
    tower.recordAttack(0);
    expect(tower.canAttack(0.49)).toBe(false);
    expect(tower.canAttack(0.5)).toBe(true);
  });

  it('selects aoe targets by radius and maxTargets', () => {
    const tower = factory.createTower('smart', 0, pathSystem);
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

  it('finds aoe targets for dragonTamer', () => {
    const tower = factory.createTower('capable', 0, pathSystem);
    factory.upgradeTower(tower, 'dragonTamer');
    const inRange = new Enemy(enemiesData[0]);
    inRange.position = { x: tower.position.x + 10, y: tower.position.y };
    inRange.progress = 0.5;
    const outRange = new Enemy(enemiesData[0]);
    outRange.position = { x: tower.position.x + 1000, y: tower.position.y };

    const target = tower.findTarget([inRange, outRange]);
    expect(target).toBe(inRange);
  });

  it('supports aoe-targeting smart tower upgrades', () => {
    const logTower = factory.createTower('smart', 0, pathSystem);
    factory.upgradeTower(logTower, 'logRoller');
    expect(logTower.config.targetMode).toBe('aoe');
    expect(logTower.config.range).toBe(7);

    const waterBomber = factory.createTower('smart', 1, pathSystem);
    factory.upgradeTower(waterBomber, 'waterBomber');
    expect(waterBomber.config.range).toBe(7);
    expect(waterBomber.config.aoeRadius).toBe(2);
  });

  it('applies anaconda attack speed debuff', () => {
    const tower = factory.createTower('agile', 0, pathSystem);
    expect(tower.getEffectiveAttackSpeed()).toBe(2);
    tower.setAttackSpeedDebuff(0.3);
    expect(tower.getEffectiveAttackSpeed()).toBe(1.7);
  });

  it('attackPhase initial value is idle', () => {
    const tower = factory.createTower('agile', 0, pathSystem);
    expect(tower.attackPhase).toBe('idle');
  });

  it('recordAttack sets attackPhase to firing', () => {
    const tower = factory.createTower('agile', 0, pathSystem);
    expect(tower.attackPhase).toBe('idle');
    tower.recordAttack(1.0);
    expect(tower.attackPhase).toBe('firing');
  });

  it('updatePhase transitions firing to cooldown after 0.15s', () => {
    const tower = factory.createTower('agile', 0, pathSystem);
    tower.recordAttack(0);
    expect(tower.attackPhase).toBe('firing');

    tower.updatePhase(0.1);
    expect(tower.attackPhase).toBe('firing');

    tower.updatePhase(0.15);
    expect(tower.attackPhase).toBe('cooldown');
  });

  it('updatePhase transitions cooldown to idle when canAttack is true', () => {
    const tower = factory.createTower('agile', 0, pathSystem);
    tower.recordAttack(0);
    expect(tower.attackPhase).toBe('firing');

    tower.updatePhase(0.15);
    expect(tower.attackPhase).toBe('cooldown');

    tower.updatePhase(0.4);
    expect(tower.attackPhase).toBe('cooldown');

    tower.updatePhase(0.5);
    expect(tower.attackPhase).toBe('idle');
  });
});
