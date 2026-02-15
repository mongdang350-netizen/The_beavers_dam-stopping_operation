import type { Projectile } from '@/entities/Projectile';
import { BaseRenderer } from '@/renderers/BaseRenderer';

export class ProjectileRenderer extends BaseRenderer<Projectile, Phaser.GameObjects.Arc, Projectile> {
  protected getKey(projectile: Projectile): Projectile {
    return projectile;
  }

  protected createVisual(projectile: Projectile): Phaser.GameObjects.Arc {
    return this.scene.add.circle(projectile.position.x, projectile.position.y, 4, 0xffe082);
  }

  protected updateVisual(visual: Phaser.GameObjects.Arc, projectile: Projectile): void {
    visual.setPosition(projectile.position.x, projectile.position.y);
  }

  protected destroyVisual(visual: Phaser.GameObjects.Arc): void {
    visual.destroy();
  }
}
