import Phaser from 'phaser';
import type { Enemy } from '@/entities/Enemy';
import { getEnemyColor } from '@/renderers/visualPolicy';

interface EnemyVisual {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Arc;
  hpBar: Phaser.GameObjects.Graphics;
  bossTween?: Phaser.Tweens.Tween;
}

export class EnemyRenderer {
  private readonly visuals = new Map<string, EnemyVisual>();

  constructor(private readonly scene: Phaser.Scene) {}

  sync(enemies: Enemy[]): void {
    const activeIds = new Set(enemies.map((enemy) => enemy.id));

    enemies.forEach((enemy) => {
      const existing = this.visuals.get(enemy.id) ?? this.createVisual(enemy);
      existing.container.setPosition(enemy.position.x, enemy.position.y);

      const hpRatio = enemy.maxHp <= 0 ? 0 : enemy.hp / enemy.maxHp;
      const width = enemy.config.isBoss ? 48 : 24;
      existing.hpBar.clear();
      existing.hpBar.fillStyle(0x000000, 0.9);
      existing.hpBar.fillRect(-width / 2, -22, width, 4);
      existing.hpBar.fillStyle(0x00ff66, 1);
      existing.hpBar.fillRect(-width / 2, -22, width * Math.max(0, hpRatio), 4);
    });

    [...this.visuals.keys()]
      .filter((id) => !activeIds.has(id))
      .forEach((id) => {
        const visual = this.visuals.get(id);
        visual?.bossTween?.remove();
        visual?.container.destroy(true);
        this.visuals.delete(id);
      });
  }

  destroy(): void {
    this.visuals.forEach((visual) => {
      visual.bossTween?.remove();
      visual.container.destroy(true);
    });
    this.visuals.clear();
  }

  private createVisual(enemy: Enemy): EnemyVisual {
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

    const visual = { container, body, hpBar, bossTween };
    this.visuals.set(enemy.id, visual);
    return visual;
  }
}
