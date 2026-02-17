import { enemiesData, stagesData, towersData } from '@/data/validatedData';

describe('type compatibility', () => {
  it('provides strongly typed tower data from schema parser', () => {
    const ids = towersData.map((tower) => tower.id);
    expect(ids).toContain('archer');
    expect(ids).toContain('waterBomber');
  });

  it('provides strongly typed enemy data from schema parser', () => {
    const ids = enemiesData.map((enemy) => enemy.id);
    expect(ids).toContain('piranha');
    expect(ids).toContain('elephant');
  });

  it('provides strongly typed stage data with exactly 3 waves', () => {
    expect(stagesData.length).toBe(10);
    stagesData.forEach((stage) => {
      expect(stage.waves).toHaveLength(3);
    });
  });
});
