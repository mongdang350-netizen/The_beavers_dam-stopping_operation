import Phaser from 'phaser';
import type { Enemy } from '@/entities/Enemy';
import type { EffectType } from '@/types';

const effectSymbolByType: Record<EffectType, string> = {
  stun: '*',
  slow: '~',
  poison: '!',
  burn: '^',
  asDeBuff: '-',
};

const effectColorByType: Record<EffectType, string> = {
  slow: '#64b5f6',
  poison: '#81c784',
  stun: '#ffcc80',
  burn: '#ff8a65',
  asDeBuff: '#b0bec5',
};

export class EffectRenderer {
  private readonly icons = new Map<string, Phaser.GameObjects.Text>();

  constructor(private readonly scene: Phaser.Scene) {}

  sync(enemies: Enemy[]): void {
    const active = new Set<string>();

    enemies.forEach((enemy) => {
      const effect = enemy.effects[0];
      if (!effect) {
        return;
      }
      active.add(enemy.id);
      const icon = this.icons.get(enemy.id) ?? this.create(enemy.id);
      icon.setPosition(enemy.position.x, enemy.position.y - 30);
      icon.setText(effectSymbolByType[effect.type]);
      icon.setColor(effectColorByType[effect.type]);
    });

    [...this.icons.keys()]
      .filter((id) => !active.has(id))
      .forEach((id) => {
        this.icons.get(id)?.destroy();
        this.icons.delete(id);
      });
  }

  destroy(): void {
    this.icons.forEach((icon) => icon.destroy());
    this.icons.clear();
  }

  private create(enemyId: string): Phaser.GameObjects.Text {
    const icon = this.scene.add
      .text(0, 0, '', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
      })
      .setOrigin(0.5);
    this.icons.set(enemyId, icon);
    return icon;
  }
}
