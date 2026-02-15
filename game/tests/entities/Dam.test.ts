import { Dam } from '@/entities/Dam';

describe('Dam', () => {
  it('takes damage and reports destruction', () => {
    const dam = new Dam();
    dam.takeDamage(50);
    expect(dam.hp).toBe(150);
    expect(dam.getHpPercent()).toBe(0.75);
    expect(dam.isDestroyed()).toBe(false);

    dam.takeDamage(999);
    expect(dam.hp).toBe(0);
    expect(dam.isDestroyed()).toBe(true);
  });
});

