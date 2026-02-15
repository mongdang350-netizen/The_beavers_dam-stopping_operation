import { enemiesData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { SoldierSquad } from '@/entities/Soldier';

const soldierConfig = {
  count: 3,
  hp: 80,
  atk: 5,
  attackSpeed: 1,
  def: 10,
  mdef: 0,
  respawnTime: 30,
};

describe('Soldier', () => {
  it('creates correct soldier counts for warrior and suit', () => {
    const warriorSquad = new SoldierSquad(
      soldierConfig,
      3,
      { x: 0, y: 0 },
      { x: 64, y: 0 },
    );
    const suitSquad = new SoldierSquad(
      { ...soldierConfig, hp: 150, atk: 7, def: 40, mdef: 20 },
      1,
      { x: 0, y: 0 },
      { x: 64, y: 0 },
      { cooldown: 5, duration: 2, radius: 1.5 },
    );
    expect(warriorSquad.getSoldiers()).toHaveLength(3);
    expect(suitSquad.getSoldiers()).toHaveLength(1);
  });

  it('moves soldiers to new rally point', () => {
    const squad = new SoldierSquad(soldierConfig, 1, { x: 0, y: 0 }, { x: 10, y: 0 });
    squad.update(1, []);
    squad.setRallyPoint({ x: 100, y: 0 });
    squad.update(1, []);
    expect(squad.getSoldiers()[0].position.x).toBeGreaterThan(10);
  });

  it('blocks approaching enemies and engages 1:1', () => {
    const squad = new SoldierSquad(soldierConfig, 3, { x: 0, y: 0 }, { x: 64, y: 0 });
    squad.update(1, []);
    const enemies = Array.from({ length: 4 }).map(() => {
      const enemy = new Enemy(enemiesData[0]);
      enemy.position = { x: 64, y: 0 };
      return enemy;
    });

    squad.update(0.1, enemies);
    const blocked = enemies.filter((enemy) => enemy.status === 'blocked');
    expect(blocked).toHaveLength(3);
    expect(enemies[3].status).toBe('moving');
  });

  it('releases enemy when soldier dies and respawns after timer', () => {
    const weakSoldierConfig = { ...soldierConfig, hp: 10, def: 0, mdef: 0 };
    const squad = new SoldierSquad(weakSoldierConfig, 1, { x: 0, y: 0 }, { x: 64, y: 0 });
    const strongEnemy = new Enemy(enemiesData.find((enemy) => enemy.id === 'crocodile')!);
    strongEnemy.position = { x: 64, y: 0 };

    squad.update(1, []);
    squad.update(0.1, [strongEnemy]);
    squad.update(1, [strongEnemy]);
    expect(squad.getSoldiers()[0].status).toBe('dead');
    expect(strongEnemy.status).toBe('moving');

    squad.update(30, [strongEnemy]);
    expect(squad.getSoldiers()[0].status).toBe('movingToRally');
  });

  it('applies suit stun aura every 5 seconds', () => {
    const suitConfig = { ...soldierConfig, hp: 150, atk: 7, def: 40, mdef: 20 };
    const squad = new SoldierSquad(
      suitConfig,
      1,
      { x: 0, y: 0 },
      { x: 64, y: 0 },
      { cooldown: 5, duration: 2, radius: 1.5 },
    );
    const enemy = new Enemy(enemiesData[0]);
    enemy.position = { x: 64, y: 0 };

    squad.update(5, [enemy]);
    const stun = enemy.effects.find((effect) => effect.type === 'stun');
    expect(stun?.duration).toBe(2);
  });
});

