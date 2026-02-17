import Phaser from 'phaser';
import { textsData } from '@/data/validatedData';
import { buildHudSnapshot } from '@/ui/hudModel';
import { DamHealthBar } from '@/ui/DamHealthBar';
import { GAME_WIDTH } from '@/utils/constants';

interface HudState {
  gold: number;
  currentStage: number;
  currentWave: number;
  damHp: number;
  damMaxHp: number;
  speed: 1 | 2;
  paused: boolean;
}

export class HUD {
  private readonly goldText: Phaser.GameObjects.Text;
  private readonly stageWaveText: Phaser.GameObjects.Text;
  private readonly damText: Phaser.GameObjects.Text;
  private readonly enemyCountText: Phaser.GameObjects.Text;
  private readonly speedText: Phaser.GameObjects.Text;
  private readonly pauseText: Phaser.GameObjects.Text;
  private readonly damHealthBar: DamHealthBar;

  constructor(scene: Phaser.Scene) {
    scene.add.rectangle(GAME_WIDTH / 2, 24, GAME_WIDTH, 56, 0x3e2723, 0.7).setDepth(999);
    this.goldText = scene.add.text(16, 12, '', this.style()).setDepth(1000);
    this.stageWaveText = scene.add.text(500, 12, '', this.style()).setDepth(1000);
    this.damText = scene.add.text(1020, 12, '', this.style()).setDepth(1000);
    this.enemyCountText = scene.add.text(1120, 60, '', this.style()).setDepth(1000);
    this.speedText = scene.add.text(1110, 680, '', this.style()).setDepth(1000);
    this.pauseText = scene.add.text(1180, 680, '', this.style()).setDepth(1000);
    this.damHealthBar = new DamHealthBar(scene, 1120, 36, 140, 16);
  }

  refresh(state: HudState, remainingEnemies: number): void {
    const snapshot = buildHudSnapshot(state, remainingEnemies, {
      gold: textsData.ko.gold,
      stage: textsData.ko.stage,
      wave: textsData.ko.wave,
      dam: textsData.ko.dam,
      enemies: textsData.ko.enemies,
      pause: textsData.ko.pause,
    });

    this.goldText.setText(snapshot.goldText);
    this.stageWaveText.setText(snapshot.stageWaveText);
    this.damText.setText(snapshot.damText);
    this.enemyCountText.setText(snapshot.remainingEnemiesText);
    this.speedText.setText(snapshot.speedText);
    this.pauseText.setText(snapshot.pauseText);
    this.damHealthBar.setValue(state.damHp, state.damMaxHp);
  }

  destroy(): void {
    this.goldText.destroy();
    this.stageWaveText.destroy();
    this.damText.destroy();
    this.enemyCountText.destroy();
    this.speedText.destroy();
    this.pauseText.destroy();
    this.damHealthBar.destroy();
  }

  private style(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      color: '#FFF8E7',
      fontFamily: "'Fredoka One', sans-serif",
      fontSize: '20px',
      stroke: '#5D4037',
      strokeThickness: 3,
    };
  }
}
