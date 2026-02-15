import { ScoreCalculator } from '@/core/ScoreCalculator';
import { enemiesData, stagesData } from '@/data/validatedData';

describe('ScoreCalculator', () => {
  const calculator = new ScoreCalculator();

  it('caps score in 0~100 range', () => {
    expect(calculator.calculateScore(200, 200, 9999, 100, 1, 1800)).toBe(100);
    expect(calculator.calculateScore(0, 200, 0, 100, 99999, 1800)).toBe(0);
  });

  it('handles zero damMaxHp safely', () => {
    expect(calculator.calculateScore(0, 0, 0, 100, 1800, 1800)).toBe(25);
  });

  it('returns 3 stars for 80+', () => {
    expect(calculator.getStars(80)).toBe(3);
  });

  it('returns 2 stars for 50~79', () => {
    expect(calculator.getStars(50)).toBe(2);
    expect(calculator.getStars(79)).toBe(2);
  });

  it('returns 1 star below 50', () => {
    expect(calculator.getStars(49)).toBe(1);
  });

  it('calculates max gold from stage+enemy data', () => {
    const value = calculator.calculateMaxGold(stagesData, enemiesData);
    expect(value).toBeGreaterThan(0);
  });
});
