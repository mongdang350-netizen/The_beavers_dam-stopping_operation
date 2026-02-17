import type { Enemy } from '@/entities/Enemy';
import { AnimatedRenderer, type SpriteVisual } from '@/renderers/AnimatedRenderer';
import { getSpriteSheetKey, getAnimationKey } from '@/assets/AssetDescriptor';

export class EnemyRenderer extends AnimatedRenderer<string, Enemy> {
  private bossTweens = new Map<string, Phaser.Tweens.Tween>();

  protected getKey(enemy: Enemy): string {
    return enemy.id;
  }

  protected createVisual(enemy: Enemy): SpriteVisual {
    this.ensureSpriteSheetsCreated();

    const enemyType = enemy.config.id;
    const sheetKey = getSpriteSheetKey('enemy', enemyType, 'walk');
    const visual = this.createSpriteVisual(
      enemy.position.x,
      enemy.position.y,
      sheetKey,
    );

    // Base scale for all enemies
    visual.sprite.setScale(1.3);

    // Scale boss enemies relative to base
    if (enemy.config.isBoss) {
      const scale = enemy.config.sizeMultiplier * 1.3;
      visual.sprite.setScale(scale);

      // Boss pulse tween
      const bossTween = this.scene.tweens.add({
        targets: visual.sprite,
        scaleX: scale * 1.08,
        scaleY: scale * 1.08,
        yoyo: true,
        repeat: -1,
        duration: 450,
      });
      this.bossTweens.set(enemy.id, bossTween);
    }

    // Add HP bar
    this.addHpBar(visual);

    // Play walk animation
    const animKey = getAnimationKey('enemy', enemyType, 'walk');
    this.playAnimation(visual.sprite, animKey);

    return visual;
  }

  protected updateVisual(visual: SpriteVisual, enemy: Enemy): void {
    // Update position
    visual.container.setPosition(enemy.position.x, enemy.position.y);

    // Update depth for isometric ordering
    visual.container.setDepth(enemy.position.y);

    // Update HP bar
    const hpRatio = enemy.maxHp <= 0 ? 0 : enemy.hp / enemy.maxHp;
    const barWidth = enemy.config.isBoss ? 48 : 24;
    this.updateHpBar(visual, hpRatio, barWidth, -28);
  }

  protected destroyVisual(visual: SpriteVisual): void {
    // Find and remove boss tween if any
    for (const [id, tween] of this.bossTweens) {
      if (visual.sprite === tween.targets[0]) {
        tween.remove();
        this.bossTweens.delete(id);
        break;
      }
    }
    super.destroyVisual(visual);
  }

  destroy(): void {
    this.bossTweens.forEach((tween) => tween.remove());
    this.bossTweens.clear();
    super.destroy();
  }
}
