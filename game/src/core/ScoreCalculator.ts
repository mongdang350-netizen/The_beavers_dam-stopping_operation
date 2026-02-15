import type { EnemyConfig, StageConfig } from '@/types';

export class ScoreCalculator {
  calculateScore(
    damHp: number,
    damMaxHp: number,
    goldRemaining: number,
    maxGold: number,
    elapsedTime: number,
    parTime: number,
  ): number {
    const normalizedDamMaxHp = damMaxHp <= 0 ? 1 : damMaxHp;
    const hpTerm = (damHp / normalizedDamMaxHp) * 50;
    const goldTerm = maxGold > 0 ? (goldRemaining / maxGold) * 25 : 0;
    const normalizedElapsed = elapsedTime <= 0 ? 1 : elapsedTime;
    const timeTerm = (parTime / normalizedElapsed) * 25;

    const rawScore = hpTerm + goldTerm + timeTerm;
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }

  getStars(score: number): 1 | 2 | 3 {
    if (score >= 80) {
      return 3;
    }

    if (score >= 50) {
      return 2;
    }

    return 1;
  }

  calculateMaxGold(stages: StageConfig[], enemies: EnemyConfig[]): number {
    const goldByEnemy = new Map(enemies.map((enemy) => [enemy.id, enemy.gold]));

    return stages.reduce((stageTotal, stage) => {
      const waveGold = stage.waves.reduce((wavesTotal, wave) => {
        const spawnGold = wave.enemies.reduce((spawnTotal, spawn) => {
          return spawnTotal + (goldByEnemy.get(spawn.type) ?? 0) * spawn.count;
        }, 0);

        return wavesTotal + spawnGold;
      }, 0);

      return stageTotal + waveGold;
    }, 0);
  }
}
