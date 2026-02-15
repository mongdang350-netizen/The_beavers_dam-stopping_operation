import { Dam } from '@/entities/Dam';
import { INITIAL_DAM_HP } from '@/utils/constants';

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

  it('initializes with default INITIAL_DAM_HP', () => {
    const dam = new Dam();
    expect(dam.hp).toBe(INITIAL_DAM_HP);
    expect(dam.maxHp).toBe(INITIAL_DAM_HP);
  });

  it('initializes with custom maxHp', () => {
    const dam = new Dam(500);
    expect(dam.hp).toBe(500);
    expect(dam.maxHp).toBe(500);
  });

  it('takeDamage reduces hp', () => {
    const dam = new Dam(100);
    dam.takeDamage(30);
    expect(dam.hp).toBe(70);
  });

  it('takeDamage does not go below 0', () => {
    const dam = new Dam(100);
    dam.takeDamage(150);
    expect(dam.hp).toBe(0);
  });

  it('takeDamage ignores negative damage', () => {
    const dam = new Dam(100);
    dam.takeDamage(-50);
    expect(dam.hp).toBe(100);
  });

  it('hp cannot exceed maxHp after reset', () => {
    const dam = new Dam(100);
    dam.takeDamage(60);
    expect(dam.hp).toBe(40);
    dam.reset();
    expect(dam.hp).toBe(100);
    expect(dam.hp).toBeLessThanOrEqual(dam.maxHp);
  });

  it('isDestroyed returns true when hp is 0', () => {
    const dam = new Dam(100);
    dam.takeDamage(100);
    expect(dam.isDestroyed()).toBe(true);
  });

  it('isDestroyed returns false when hp is above 0', () => {
    const dam = new Dam(100);
    dam.takeDamage(99);
    expect(dam.isDestroyed()).toBe(false);
  });

  it('getHpPercent returns correct ratio', () => {
    const dam = new Dam(200);
    dam.takeDamage(50);
    expect(dam.getHpPercent()).toBeCloseTo(0.75);
  });

  it('getHpPercent returns 0 when maxHp is 0', () => {
    const dam = new Dam(0);
    expect(dam.getHpPercent()).toBe(0);
  });

  it('reset restores hp to maxHp', () => {
    const dam = new Dam(100);
    dam.takeDamage(80);
    expect(dam.hp).toBe(20);
    dam.reset();
    expect(dam.hp).toBe(100);
  });

  it('multiple damage applications accumulate correctly', () => {
    const dam = new Dam(100);
    dam.takeDamage(10);
    dam.takeDamage(20);
    dam.takeDamage(30);
    expect(dam.hp).toBe(40);
  });
});
