import type { Enemy } from '@/entities/Enemy';
import type { EffectType } from '@/types';
import { BaseRenderer } from '@/renderers/BaseRenderer';

const effectSymbolByType: Record<EffectType, string> = {
  stun: '*',
  slow: '~',
  poison: '!',
  burn: '^',
  asDeBuff: '-',
};

const effectColorByType: Record<EffectType, string> = {
  slow: '#87CEEB',
  poison: '#A8D8A8',
  stun: '#FFF3D6',
  burn: '#D4A76A',
  asDeBuff: '#C8C8C8',
};

export class EffectRenderer extends BaseRenderer<string, Phaser.GameObjects.Text, Enemy> {
  sync(enemies: Enemy[]): void {
    const withEffects = enemies.filter((enemy) => enemy.effects[0]);
    super.sync(withEffects);
  }

  protected getKey(enemy: Enemy): string {
    return enemy.id;
  }

  protected createVisual(_enemy: Enemy): Phaser.GameObjects.Text {
    return this.scene.add
      .text(0, 0, '', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
      })
      .setOrigin(0.5);
  }

  protected updateVisual(icon: Phaser.GameObjects.Text, enemy: Enemy): void {
    const effect = enemy.effects[0];
    icon.setPosition(enemy.position.x, enemy.position.y - 30);
    icon.setText(effectSymbolByType[effect.type]);
    icon.setColor(effectColorByType[effect.type]);
  }

  protected destroyVisual(icon: Phaser.GameObjects.Text): void {
    icon.destroy();
  }
}
