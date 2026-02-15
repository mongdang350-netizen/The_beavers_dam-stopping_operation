import { buildHudSnapshot } from '@/ui/hudModel';

describe('buildHudSnapshot', () => {
  it('formats HUD text with stage/wave and resources', () => {
    const snapshot = buildHudSnapshot(
      {
        gold: 320,
        currentStage: 2,
        currentWave: 3,
        damHp: 150,
        damMaxHp: 200,
        speed: 2,
        paused: false,
      },
      42,
      {
        gold: '골드',
        stage: '스테이지',
        wave: '웨이브',
        dam: '댐',
        enemies: '적',
        pause: '일시정지',
      },
    );

    expect(snapshot.goldText).toContain('320');
    expect(snapshot.stageWaveText).toContain('2');
    expect(snapshot.stageWaveText).toContain('3');
    expect(snapshot.remainingEnemiesText).toContain('적');
    expect(snapshot.remainingEnemiesText).toContain('42');
    expect(snapshot.speedText).toBe('2x');
    expect(snapshot.pauseText).toBe('');
  });
});
