import Phaser from 'phaser';
import type { Position } from '@/types';

/**
 * Renders the dam using pixel art textures that change based on HP.
 * Also renders the baby beaver with expressions matching dam health.
 */
export class DamRenderer {
  private damSprite: Phaser.GameObjects.Sprite | null = null;
  private babySprite: Phaser.GameObjects.Sprite | null = null;
  private currentStage = -1;
  private currentExpression = -1;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly damPosition: Position,
  ) {}

  /** Create the dam and baby beaver sprites */
  create(): void {
    // Dam sprite
    const damKey = 'dam_stage_0';
    if (this.scene.textures.exists(damKey)) {
      this.damSprite = this.scene.add.sprite(
        this.damPosition.x,
        this.damPosition.y,
        damKey,
      );
      this.damSprite.setDepth(50);
      this.currentStage = 0;
    }

    // Baby beaver behind the dam
    const babyKey = 'baby_beaver_0';
    if (this.scene.textures.exists(babyKey)) {
      this.babySprite = this.scene.add.sprite(
        this.damPosition.x,
        this.damPosition.y - 30,
        babyKey,
      );
      this.babySprite.setDepth(49);
      this.currentExpression = 0;
    }
  }

  /**
   * Update dam visual based on current HP.
   * @param damHp Current dam HP
   * @param damMaxHp Maximum dam HP
   */
  sync(damHp: number, damMaxHp: number): void {
    if (damMaxHp <= 0) return;

    const hpRatio = damHp / damMaxHp;

    // Determine dam stage (0 = healthy, 3 = nearly destroyed)
    let stage: number;
    if (hpRatio > 0.75) {
      stage = 0;
    } else if (hpRatio > 0.5) {
      stage = 1;
    } else if (hpRatio > 0.25) {
      stage = 2;
    } else {
      stage = 3;
    }

    // Update dam texture if stage changed
    if (stage !== this.currentStage && this.damSprite) {
      const stageKey = `dam_stage_${stage}`;
      if (this.scene.textures.exists(stageKey)) {
        this.damSprite.setTexture(stageKey);
        this.currentStage = stage;
      }
    }

    // Determine baby expression based on HP
    // 0 = happy, 1 = sad, 2 = scared, 3 = sleeping (at 0 HP / game over)
    let expression: number;
    if (hpRatio > 0.75) {
      expression = 0; // happy
    } else if (hpRatio > 0.5) {
      expression = 1; // sad
    } else if (hpRatio > 0) {
      expression = 2; // scared
    } else {
      expression = 3; // sleeping / defeated
    }

    // Update baby texture if expression changed
    if (expression !== this.currentExpression && this.babySprite) {
      const exprKey = `baby_beaver_${expression}`;
      if (this.scene.textures.exists(exprKey)) {
        this.babySprite.setTexture(exprKey);
        this.currentExpression = expression;
      }
    }
  }

  destroy(): void {
    this.damSprite?.destroy();
    this.babySprite?.destroy();
    this.damSprite = null;
    this.babySprite = null;
  }
}
