interface HudSource {
  gold: number;
  currentStage: number;
  currentWave: number;
  damHp: number;
  damMaxHp: number;
  speed: 1 | 2;
  paused: boolean;
}

interface HudTexts {
  gold: string;
  stage: string;
  wave: string;
  dam: string;
  enemies: string;
  pause: string;
}

export interface HudSnapshot {
  goldText: string;
  stageWaveText: string;
  damText: string;
  remainingEnemiesText: string;
  speedText: string;
  pauseText: string;
  paused: boolean;
}

export const buildHudSnapshot = (
  source: HudSource,
  remainingEnemies: number,
  texts: HudTexts,
): HudSnapshot => {
  return {
    goldText: `${texts.gold}: ${source.gold}`,
    stageWaveText: `${texts.stage} ${source.currentStage} - ${texts.wave} ${source.currentWave}/3`,
    damText: `${texts.dam}: ${Math.ceil(source.damHp)} / ${source.damMaxHp}`,
    remainingEnemiesText: `${texts.enemies}: ${remainingEnemies}`,
    speedText: `${source.speed}x`,
    pauseText: source.paused ? texts.pause : '',
    paused: source.paused,
  };
};
