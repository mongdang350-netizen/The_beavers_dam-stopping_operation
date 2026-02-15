import { mapsData } from '@/data/validatedData';
import { buildGameSceneLayout } from '@/scenes/layout';

describe('buildGameSceneLayout', () => {
  it('builds default map layout with river, slots and dam', () => {
    const layout = buildGameSceneLayout(mapsData.defaultMap);

    expect(layout.riverPath.length).toBeGreaterThanOrEqual(2);
    expect(layout.slots).toHaveLength(6);
    expect(layout.damPosition).toEqual(mapsData.defaultMap.damPosition);
    expect(layout.bounds.width).toBe(1280);
    expect(layout.bounds.height).toBe(720);
  });
});
