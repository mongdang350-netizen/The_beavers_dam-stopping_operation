import { DamageCalculator } from '@/core/DamageCalculator';

describe('DamageCalculator', () => {
  const calculator = new DamageCalculator();

  it('applies physical defense', () => {
    expect(calculator.calculateDamage(10, 'physical', 3, 0)).toBe(7);
  });

  it('applies magical defense', () => {
    expect(calculator.calculateDamage(10, 'magical', 0, 4)).toBe(6);
  });

  it('ensures at least 1 damage from regular attacks', () => {
    expect(calculator.calculateDamage(3, 'physical', 10, 0)).toBe(1);
    expect(calculator.calculateDamage(2, 'magical', 0, 10)).toBe(1);
  });

  it('returns non-negative poison damage', () => {
    expect(calculator.calculatePoisonDamage(3)).toBe(3);
    expect(calculator.calculatePoisonDamage(-1)).toBe(0);
  });
});
