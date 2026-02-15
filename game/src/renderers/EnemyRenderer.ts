import Phaser from 'phaser';
import type { Enemy } from '@/entities/Enemy';
import { getEnemyColor } from '@/renderers/visualPolicy';
import { BaseRenderer } from '@/renderers/BaseRenderer';

interface EnemyVisual {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Arc;
  hpBar: Phaser.GameObjects.Graphics;
  bossTween?: Phaser.Tweens.Tween;
}

export class EnemyRenderer extends BaseRenderer<string, EnemyVisual, Enemy> {
  protected getKey(enemy: Enemy): string {
    return enemy.id;
  }

  protected createVisual(enemy: Enemy): EnemyVisual {
    const radius = Math.max(8, 10 * enemy.config.sizeMultiplier);
    const body = this.scene.add.circle(0, 0, radius, getEnemyColor(enemy.config.id));
    let bossTween: Phaser.Tweens.Tween | undefined;
    if (enemy.config.isBoss) {
      bossTween = this.scene.tweens.add({
        targets: body,
        scale: 1.08,
        yoyo: true,
        repeat: -1,
        duration: 450,
      });
    }
    const hpBar = this.scene.add.graphics();
    const container = this.scene.add.container(enemy.position.x, enemy.position.y, [body, hpBar]);

    return { container, body, hpBar, bossTween };
  }

  protected updateVisual(visual: EnemyVisual, enemy: Enemy): void {
    visual.container.setPosition(enemy.position.x, enemy.position.y);

    const hpRatio = enemy.maxHp <= 0 ? 0 : enemy.hp / enemy.maxHp;
    const width = enemy.config.isBoss ? 48 : 24;
    visual.hpBar.clear();
    visual.hpBar.fillStyle(0x000000, 0.9);
    visual.hpBar.fillRect(-width / 2, -22, width, 4);
    visual.hpBar.fillStyle(0x00ff66, 1);
    visual.hpBar.fillRect(-width / 2, -22, width * Math.max(0, hpRatio), 4);
  }

  protected destroyVisual(visual: EnemyVisual): void {
    visual.bossTween?.remove();
    visual.container.destroy(true);
  }
}
