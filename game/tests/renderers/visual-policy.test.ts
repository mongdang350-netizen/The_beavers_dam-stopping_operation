import { getEnemyColor, getTowerColor, visualPolicy } from '@/renderers/visualPolicy';

describe('visualPolicy', () => {
  it('contains placeholder style values for phase 10 rendering', () => {
    expect(visualPolicy.backgroundLandColor).toBeTypeOf('number');
    expect(visualPolicy.riverColor).toBeTypeOf('number');
    expect(visualPolicy.damColor).toBeTypeOf('number');
  });

  it('maps enemy and tower ids to deterministic placeholder colors', () => {
    expect(getEnemyColor('piranha')).not.toBe(getEnemyColor('elephant'));
    expect(getTowerColor('agile')).not.toBe(getTowerColor('smart'));
  });
});
