import type { Projectile } from '@/entities/Projectile';
import { BaseRenderer } from '@/renderers/BaseRenderer';
import { getProjectileTextureKey } from '@/renderers/textureRegistration';

interface ProjectileVisual {
  sprite: Phaser.GameObjects.Sprite;
}

export class ProjectileRenderer extends BaseRenderer<Projectile, ProjectileVisual, Projectile> {
  protected getKey(projectile: Projectile): Projectile {
    return projectile;
  }

  protected createVisual(projectile: Projectile): ProjectileVisual {
    const textureKey = getProjectileTextureKey(projectile.sourceType);
    let sprite: Phaser.GameObjects.Sprite;

    if (this.scene.textures.exists(textureKey)) {
      sprite = this.scene.add.sprite(
        projectile.position.x,
        projectile.position.y,
        textureKey,
      );
    } else {
      // Fallback: create a small circle if texture not found
      sprite = this.scene.add.sprite(
        projectile.position.x,
        projectile.position.y,
        '__DEFAULT',
      );
      sprite.setDisplaySize(8, 8);
    }

    sprite.setDepth(projectile.position.y + 5);

    return { sprite };
  }

  protected updateVisual(visual: ProjectileVisual, projectile: Projectile): void {
    visual.sprite.setPosition(projectile.position.x, projectile.position.y);
    visual.sprite.setDepth(projectile.position.y + 5);
  }

  protected destroyVisual(visual: ProjectileVisual): void {
    visual.sprite.destroy();
  }
}
