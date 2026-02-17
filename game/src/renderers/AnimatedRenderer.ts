import Phaser from 'phaser';
import { BaseRenderer } from '@/renderers/BaseRenderer';
import { assetManager } from '@/assets/AssetManager';
import type { AnimationState } from '@/assets/AssetDescriptor';

/** Visual representation using sprites */
export interface SpriteVisual {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  hpBar?: Phaser.GameObjects.Graphics;
  label?: Phaser.GameObjects.Text;
}

/**
 * Interface that entities should satisfy for animated rendering.
 * NOTE: Existing entities don't implement this yet - subclasses handle mapping internally.
 */
export interface IAnimatedEntity {
  position: { x: number; y: number };
  getTextureKey(): string;
  getAnimState(): AnimationState;
}

/**
 * Base class for sprite-based rendering using the pixel art asset system.
 * Extends BaseRenderer with sprite management, animation playback, and optional HP bars.
 */
export abstract class AnimatedRenderer<TKey, TEntity> extends BaseRenderer<
  TKey,
  SpriteVisual,
  TEntity
> {
  private animationsCreated = false;

  /**
   * Ensure sprite sheets and animations are created for this scene.
   * Call this once before creating visuals.
   */
  protected ensureSpriteSheetsCreated(): void {
    if (!this.animationsCreated) {
      assetManager.createAnimations(this.scene);
      this.animationsCreated = true;
    }
  }

  /**
   * Safely play an animation on a sprite if it exists.
   * @param sprite The sprite to animate
   * @param animKey The animation key to play
   */
  protected playAnimation(sprite: Phaser.GameObjects.Sprite, animKey: string): void {
    if (this.scene.anims.exists(animKey)) {
      sprite.play(animKey, true);
    } else {
      console.warn(`Animation not found: ${animKey}`);
    }
  }

  /**
   * Create a sprite visual with container.
   * @param x X position
   * @param y Y position
   * @param textureKey Texture key for the sprite
   * @param depth Optional depth override (defaults to y-based depth)
   */
  protected createSpriteVisual(
    x: number,
    y: number,
    textureKey: string,
    depth?: number
  ): SpriteVisual {
    const container = this.scene.add.container(x, y);
    const sprite = this.scene.add.sprite(0, 0, textureKey);
    container.add(sprite);

    // Set depth for isometric ordering (use y-position if depth not provided)
    container.setDepth(depth ?? y);

    return { container, sprite };
  }

  /**
   * Add an HP bar to a visual's container.
   * @param visual The sprite visual to add HP bar to
   */
  protected addHpBar(visual: SpriteVisual): void {
    const hpBar = this.scene.add.graphics();
    visual.container.add(hpBar);
    visual.hpBar = hpBar;
  }

  /**
   * Update the HP bar fill based on health ratio.
   * @param visual The sprite visual with HP bar
   * @param ratio Health ratio (0-1)
   * @param barWidth Width of the HP bar
   * @param yOffset Vertical offset from sprite center (default: -20)
   */
  protected updateHpBar(
    visual: SpriteVisual,
    ratio: number,
    barWidth: number,
    yOffset: number = -20
  ): void {
    if (!visual.hpBar) return;

    const height = 4;
    const x = -barWidth / 2;
    const y = yOffset;

    visual.hpBar.clear();

    // Background (dark gray)
    visual.hpBar.fillStyle(0x333333, 0.8);
    visual.hpBar.fillRect(x, y, barWidth, height);

    // Health fill (green to red gradient)
    const color = ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000;
    visual.hpBar.fillStyle(color, 1);
    visual.hpBar.fillRect(x, y, barWidth * Math.max(0, ratio), height);
  }

  /**
   * Destroy a sprite visual and clean up resources.
   */
  protected destroyVisual(visual: SpriteVisual): void {
    visual.sprite.destroy();
    visual.hpBar?.destroy();
    visual.label?.destroy();
    visual.container.destroy();
  }
}
